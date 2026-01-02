local m = Map("tv_limit", translate("MyBaby Configuration"))

local s = m:section(TypedSection, "global", translate("Global"))
s.anonymous = true
local o
o = s:option(Flag, "enabled", translate("Enable"))
o.rmempty = false

local d = m:section(TypedSection, "device", translate("Devices"))
d.anonymous = true
d.addremove = true
d.template = "cbi/tsection"
o = d:option(Value, "name", translate("Name"))
o.rmempty = false
o = d:option(Value, "mac", translate("MAC"))
o.datatype = "macaddr"
o.rmempty = false
o = d:option(Value, "limit", translate("Limit (minutes)"))
o.datatype = "uinteger"
o.rmempty = true
o = d:option(Value, "schedule", translate("Schedule"))
o.rmempty = true
o = d:option(Flag, "enabled", translate("Enabled"))
o.rmempty = false

return m
