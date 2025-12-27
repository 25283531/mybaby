module("luci.controller.mybaby", package.seeall)

function index()
	entry({"admin", "services", "mybaby"}, firstchild(), _("MyBaby"), 30).dependent = false
	entry({"admin", "services", "mybaby", "main"}, template("mybaby/main"), _("MyBaby Control"), 1)
	entry({"admin", "services", "mybaby", "config"}, cbi("mybaby/config"), _("Configuration"), 2)
	
	-- API endpoints
	entry({"admin", "services", "mybaby", "api", "devices"}, call("get_devices")).leaf = true
	entry({"admin", "services", "mybaby", "api", "add_device"}, call("add_device")).leaf = true
	entry({"admin", "services", "mybaby", "api", "remove_device"}, call("remove_device")).leaf = true
	entry({"admin", "services", "mybaby", "api", "update_device"}, call("update_device")).leaf = true
	entry({"admin", "services", "mybaby", "api", "get_status"}, call("get_status")).leaf = true
	entry({"admin", "services", "mybaby", "api", "save_config"}, call("save_config")).leaf = true
end

function get_devices()
	local uci = require "luci.model.uci".cursor()
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
	
	luci.http.prepare_content("application/json")
	luci.http.write_json(devices)
end

function add_device()
	local uci = require "luci.model.uci".cursor()
	local json = require "luci.jsonc"
	
	local http = require "luci.http"
	local content = http.content()
	local data = json.parse(content)
	
	if not data or not data.mac or not data.name then
		luci.http.status(400, "Bad Request")
		return
	end
	
	local section = uci:add("tv_limit", "device")
	uci:set("tv_limit", section, "name", data.name)
	uci:set("tv_limit", section, "mac", data.mac)
	uci:set("tv_limit", section, "limit", data.limit or "120")
	uci:set("tv_limit", section, "schedule", data.schedule or "")
	uci:set("tv_limit", section, "enabled", data.enabled and "1" or "0")
	uci:commit("tv_limit")
	
	luci.http.prepare_content("application/json")
	luci.http.write_json({success = true})
end

function remove_device()
	local uci = require "luci.model.uci".cursor()
	local json = require "luci.jsonc"
	
	local http = require "luci.http"
	local content = http.content()
	local data = json.parse(content)
	
	if not data or not data.mac then
		luci.http.status(400, "Bad Request")
		return
	end
	
	uci:foreach("tv_limit", "device", function(s)
		if s.mac == data.mac then
			uci:delete("tv_limit", s[".name"])
			return false
		end
	end)
	uci:commit("tv_limit")
	
	luci.http.prepare_content("application/json")
	luci.http.write_json({success = true})
end

function update_device()
	local uci = require "luci.model.uci".cursor()
	local json = require "luci.jsonc"
	
	local http = require "luci.http"
	local content = http.content()
	local data = json.parse(content)
	
	if not data or not data.mac then
		luci.http.status(400, "Bad Request")
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
	
	luci.http.prepare_content("application/json")
	luci.http.write_json({success = true})
end

function get_status()
	local uci = require "luci.model.uci".cursor()
	local status = {
		enabled = uci:get("tv_limit", "global", "enabled") == "1",
		mode = uci:get("tv_limit", "global", "mode") or "quota"
	}
	
	luci.http.prepare_content("application/json")
	luci.http.write_json(status)
end

function save_config()
	local uci = require "luci.model.uci".cursor()
	local json = require "luci.jsonc"
	
	local http = require "luci.http"
	local content = http.content()
	local data = json.parse(content)
	
	if not data then
		luci.http.status(400, "Bad Request")
		return
	end
	
	if data.enabled ~= nil then uci:set("tv_limit", "global", "enabled", data.enabled and "1" or "0") end
	if data.mode then uci:set("tv_limit", "global", "mode", data.mode) end
	
	uci:commit("tv_limit")
	
	luci.http.prepare_content("application/json")
	luci.http.write_json({success = true})
end