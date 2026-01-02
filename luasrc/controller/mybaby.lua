-- LuCI controller for MyBaby TV Limit application
module("luci.controller.mybaby", package.seeall)

-- Import required LuCI modules
local nixio = require "nixio"
local fs = require "nixio.fs"
local sys = require "luci.sys"
local http = require "luci.http"
local uci = require "luci.model.uci".cursor()
local json = require "luci.jsonc"

-- Import LuCI dispatcher functions (these are globally available in LuCI)
local entry = luci.dispatcher.entry
local template = luci.dispatcher.template
local cbi = luci.dispatcher.cbi
local call = luci.dispatcher.call
local firstchild = luci.dispatcher.firstchild
local _ = luci.i18n.translate

function index()
	entry({"admin", "services", "mybaby"}, firstchild(), _("MyBaby"), 30).dependent = false
	entry({"admin", "services", "mybaby", "main"}, template("mybaby/main"), _("MyBaby Control"), 1)
	entry({"admin", "services", "mybaby", "config"}, cbi("mybaby/config"), _("Configuration"), 2)
	
	-- API endpoints
	entry({"admin", "services", "mybaby", "api", "devices"}, call("get_devices")).leaf = true
	entry({"admin", "services", "mybaby", "api", "add_device"}, call("add_device")).leaf = true
	entry({"admin", "services", "mybaby", "api", "remove_device"}, call("remove_device")).leaf = true
	entry({"admin", "services", "mybaby", "api", "update_device"}, call("update_device")).leaf = true
	entry({"admin", "services", "mybaby", "api", "recent_devices"}, call("get_recent_devices")).leaf = true
	entry({"admin", "services", "mybaby", "api", "get_status"}, call("get_status")).leaf = true
	entry({"admin", "services", "mybaby", "api", "save_config"}, call("save_config")).leaf = true
end

function get_devices()
	local devices = {}
	
	uci:foreach("tv_limit", "device", function(s)
		table.insert(devices, {
			name = s.name or "",
			mac = s.mac or "",
			limit = tonumber(s.limit) or 0,
			schedule = s.schedule or "",
			enabled = s.enabled == "1"
		})
	end)
	
	http.prepare_content("application/json")
	http.write_json(devices)
end

function add_device()
	local content = http.content()
	local data = json.parse(content)
	
	if not data or not data.mac or not data.name then
		http.status(400, "Bad Request")
		return
	end
	
	local section = uci:add("tv_limit", "device")
	uci:set("tv_limit", section, "name", data.name)
	uci:set("tv_limit", section, "mac", data.mac)
	uci:set("tv_limit", section, "limit", data.limit or "120")
	uci:set("tv_limit", section, "schedule", data.schedule or "")
	uci:set("tv_limit", section, "enabled", data.enabled and "1" or "0")
	uci:commit("tv_limit")
	
	-- Apply changes
	sys.call("/etc/init.d/tv_limit reload >/dev/null 2>&1")
	
	http.prepare_content("application/json")
	http.write_json({success = true})
end

function remove_device()
	local content = http.content()
	local data = json.parse(content)
	
	if not data or not data.mac then
		http.status(400, "Bad Request")
		return
	end
	
	uci:foreach("tv_limit", "device", function(s)
		if s.mac == data.mac then
			uci:delete("tv_limit", s[".name"])
			return false
		end
	end)
	uci:commit("tv_limit")
	
	-- Apply changes
	sys.call("/etc/init.d/tv_limit reload >/dev/null 2>&1")
	
	http.prepare_content("application/json")
	http.write_json({success = true})
end

function update_device()
	local content = http.content()
	local data = json.parse(content)
	
	if not data or not data.mac then
		http.status(400, "Bad Request")
		return
	end
	
	uci:foreach("tv_limit", "device", function(s)
		if s.mac == data.mac then
			if data.name then uci:set("tv_limit", s[".name"], "name", data.name) end
			if data.limit then uci:set("tv_limit", s[".name"], "limit", tostring(data.limit)) end
			if data.schedule then uci:set("tv_limit", s[".name"], "schedule", data.schedule) end
			if data.enabled ~= nil then uci:set("tv_limit", s[".name"], "enabled", data.enabled and "1" or "0") end
			return false
		end
	end)
	uci:commit("tv_limit")
	
	-- Apply changes
	sys.call("/etc/init.d/tv_limit reload >/dev/null 2>&1")
	
	http.prepare_content("application/json")
	http.write_json({success = true})
end

function get_status()
	local status = {
		enabled = uci:get("tv_limit", "global", "enabled") == "1",
		mode = uci:get("tv_limit", "global", "mode") or "quota"
	}
	
	http.prepare_content("application/json")
	http.write_json(status)
end

function save_config()
	local content = http.content()
	local data = json.parse(content)
	
	if not data then
		http.status(400, "Bad Request")
		return
	end
	
	if data.enabled ~= nil then uci:set("tv_limit", "global", "enabled", data.enabled and "1" or "0") end
	if data.mode then uci:set("tv_limit", "global", "mode", data.mode) end
	
	uci:commit("tv_limit")
	
	-- Apply changes
	sys.call("/etc/init.d/tv_limit reload >/dev/null 2>&1")
	
	http.prepare_content("application/json")
	http.write_json({success = true})
end

local function normalize_mac(mac)
	if not mac then return "" end
	return (tostring(mac):upper():gsub("%-", ":"))
end

local function read_lines(path)
	local data = fs.readfile(path)
	if not data or data == "" then return {} end
	local lines = {}
	for line in data:gmatch("[^\r\n]+") do
		table.insert(lines, line)
	end
	return lines
end

local function load_seen_db(path)
	local raw = fs.readfile(path)
	if not raw or raw == "" then return {} end
	local ok, parsed = pcall(json.parse, raw)
	if ok and type(parsed) == "table" then return parsed end
	return {}
end

local function save_seen_db(path, db)
	local dir = path:match("(.+)/[^/]+$")
	if dir and not fs.stat(dir) then
		fs.mkdir(dir)
	end
	fs.writefile(path, json.stringify(db))
end

function get_recent_devices()
	local now = os.time()
	local cutoff = now - (7 * 24 * 60 * 60)
	local db_path = "/etc/tv_limit/seen_devices.json"

	local db = load_seen_db(db_path)
	local current = {}

	for _, line in ipairs(read_lines("/tmp/dhcp.leases")) do
		local expires, mac, ip, hostname = line:match("^(%S+)%s+(%S+)%s+(%S+)%s+(%S+)")
		if mac and ip then
			mac = normalize_mac(mac)
			if mac ~= "" then
				current[mac] = current[mac] or {}
				current[mac].online = true
				current[mac].ip = ip
				if hostname and hostname ~= "*" then
					current[mac].hostname = hostname
				end
				if expires then
					current[mac].leaseExpiresAt = tonumber(expires) or current[mac].leaseExpiresAt
				end
			end
		end
	end

	local arp_lines = read_lines("/proc/net/arp")
	for i = 2, #arp_lines do
		local parts = {}
		for p in arp_lines[i]:gmatch("%S+") do
			table.insert(parts, p)
		end
		local ip = parts[1]
		local flags = parts[3]
		local mac = parts[4]
		if ip and mac and flags and flags ~= "0x0" then
			mac = normalize_mac(mac)
			if mac ~= "" and mac ~= "00:00:00:00:00:00" then
				current[mac] = current[mac] or {}
				current[mac].online = true
				current[mac].ip = current[mac].ip or ip
			end
		end
	end

	for mac, info in pairs(current) do
		local rec = db[mac] or { mac = mac }
		rec.mac = mac
		if info.ip then rec.ip = info.ip end
		if info.hostname then rec.hostname = info.hostname end
		rec.lastSeenAt = now
		rec.lastSeen = os.date("!%Y-%m-%dT%H:%M:%SZ", now)
		rec.online = true
		db[mac] = rec
	end

	for mac, rec in pairs(db) do
		rec.online = current[mac] and true or false
	end

	save_seen_db(db_path, db)

	local list = {}
	for _, rec in pairs(db) do
		local lastSeenAt = tonumber(rec.lastSeenAt) or 0
		if lastSeenAt >= cutoff then
			table.insert(list, rec)
		end
	end

	table.sort(list, function(a, b)
		return (tonumber(a.lastSeenAt) or 0) > (tonumber(b.lastSeenAt) or 0)
	end)

	http.prepare_content("application/json")
	http.write_json(list)
end
