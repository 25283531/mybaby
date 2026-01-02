
import React, { useState, useEffect } from 'react';
import { Device, ControlMode, ScheduleWindow, Platform } from '../types';

interface DeviceListProps {
  devices: Device[];
  platforms: Platform[];
  onUpdate: (device: Device) => void;
  onAdd: (device: Device) => void;
  onDelete: (id: string) => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, platforms, onUpdate, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  // Modal Form State
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [mode, setMode] = useState<ControlMode>(ControlMode.QUOTA);
  const [quotaMins, setQuotaMins] = useState(60);
  const [schedules, setSchedules] = useState<ScheduleWindow[]>([]);
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Define color mapping for device status badges
  const statusColors: Record<string, string> = {
    online: 'bg-green-100 text-green-700',
    offline: 'bg-slate-100 text-slate-600',
    blocked: 'bg-red-100 text-red-700',
  };

  useEffect(() => {
    if (editingDevice) {
      setName(editingDevice.name);
      setMac(editingDevice.mac);
      setMode(editingDevice.mode);
      setQuotaMins(editingDevice.quota?.weekdayLimitMinutes || 60);
      setSchedules(editingDevice.schedules || []);
      setSelectedPlatformIds(editingDevice.platformIds || platforms.filter(p => p.enabled).map(p => p.id));
    } else {
      setName('');
      setMac('');
      setMode(ControlMode.QUOTA);
      setQuotaMins(60);
      setSchedules([{ id: Date.now().toString(), start: '18:30', end: '20:00', days: [1, 2, 3, 4, 5] }]);
      setSelectedPlatformIds(platforms.filter(p => p.enabled).map(p => p.id));
    }
    setError('');
  }, [editingDevice, isModalOpen, platforms]);

  const validateMac = (val: string) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(val);
  };

  const handleSave = () => {
    if (!name.trim()) return setError('请输入设备名称');
    if (!mac.trim()) return setError('请输入 MAC 地址');
    if (!validateMac(mac)) return setError('MAC 地址格式不正确 (支持 : 或 -)');

    const deviceData: Device = {
      id: editingDevice?.id || `d-${Date.now()}`,
      name,
      mac,
      mode,
      platformIds: selectedPlatformIds,
      timeUsedToday: editingDevice?.timeUsedToday || 0,
      status: editingDevice?.status || 'offline',
      lastSeen: editingDevice?.lastSeen || new Date().toLocaleString(),
      quota: mode === ControlMode.QUOTA ? { weekdayLimitMinutes: quotaMins, weekendLimitMinutes: quotaMins } : undefined,
      schedules: mode === ControlMode.SCHEDULE ? schedules : undefined
    };

    if (editingDevice) {
      onUpdate(deviceData);
    } else {
      onAdd(deviceData);
    }
    setIsModalOpen(false);
  };

  // Function to initiate device editing
  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  const addSchedule = () => {
    setSchedules([...schedules, { id: Date.now().toString(), start: '09:00', end: '10:00', days: [1, 2, 3, 4, 5] }]);
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const updateSchedule = (id: string, field: keyof ScheduleWindow, value: any) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleDay = (scheduleId: string, dayIndex: number) => {
    setSchedules(schedules.map(s => {
      if (s.id === scheduleId) {
        const newDays = s.days.includes(dayIndex) 
          ? s.days.filter(d => d !== dayIndex) 
          : [...s.days, dayIndex];
        return { ...s, days: newDays };
      }
      return s;
    }));
  };

  const togglePlatformSelection = (id: string) => {
    setSelectedPlatformIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">受控设备列表 / Controlled Devices</h3>
        <button 
          onClick={() => { setEditingDevice(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
        >
          <i className="fa-solid fa-plus"></i> 添加设备 Add Device
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
            <tr>
              <th className="px-6 py-4">设备信息 Device</th>
              <th className="px-6 py-4">MAC 地址</th>
              <th className="px-6 py-4">控制模式 Mode</th>
              <th className="px-6 py-4">今日已用 Usage</th>
              <th className="px-6 py-4">状态 Status</th>
              <th className="px-6 py-4 text-right">操作 Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map(device => (
              <tr key={device.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-lg">
                      <i className={`fa-solid ${device.name.includes('电视') ? 'fa-tv' : 'fa-tablet-screen-button'}`}></i>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{device.name}</p>
                      <p className="text-xs text-slate-400">Last seen: {device.lastSeen}</p>
                      <p className="text-xs text-slate-400">规则集: {device.platformIds?.length || 0}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                    {device.mac}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    device.mode === ControlMode.QUOTA ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {device.mode === ControlMode.QUOTA ? '累计时长 Quota' : '固定时段 Schedule'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full max-w-[100px] space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">{device.timeUsedToday} min</span>
                      <span className="text-slate-400 font-medium">
                        {device.mode === ControlMode.QUOTA ? `/ ${device.quota?.weekdayLimitMinutes || 60}` : '(定时段)'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          device.mode === ControlMode.QUOTA && (device.timeUsedToday / (device.quota?.weekdayLimitMinutes || 60)) > 0.9 ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${device.mode === ControlMode.QUOTA ? Math.min(100, (device.timeUsedToday / (device.quota?.weekdayLimitMinutes || 60)) * 100) : 50}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${statusColors[device.status] || 'bg-slate-100'}`}>
                    {device.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(device)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onClick={() => onDelete(device.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">{editingDevice ? '编辑设备' : '添加新设备'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 italic">设备名称 Name *</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：客厅小米电视"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 italic">MAC 地址 MAC Address *</label>
                <input 
                  type="text" 
                  value={mac}
                  onChange={(e) => setMac(e.target.value.toUpperCase())}
                  placeholder="AA:BB:CC:DD:EE:FF"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 italic">控制模式 Control Mode</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setMode(ControlMode.QUOTA)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${mode === ControlMode.QUOTA ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'}`}
                  >
                    累计时长 Quota
                  </button>
                  <button 
                    onClick={() => setMode(ControlMode.SCHEDULE)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${mode === ControlMode.SCHEDULE ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-purple-300'}`}
                  >
                    固定时段 Fixed Slots
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 italic">控制规则 / Platforms</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {platforms.map((p) => {
                    const checked = selectedPlatformIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatformSelection(p.id)}
                        className={`px-3 py-2 rounded-lg border text-left text-sm font-bold flex items-center gap-2 transition-all ${
                          checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <i className={`fa-solid ${p.icon}`}></i>
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {mode === ControlMode.QUOTA ? (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <label className="block text-xs font-bold text-blue-700 uppercase italic">每日配额 (分钟)</label>
                  <input 
                    type="number" 
                    value={quotaMins}
                    onChange={(e) => setQuotaMins(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <p className="text-[10px] text-blue-600 italic">当设备累计访问限制规则中的平台达到该时长时，将自动拦截该平台的后续访问。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase italic">活跃时间段 Fixed Slots</label>
                    <button 
                      onClick={addSchedule}
                      className="text-xs font-bold text-purple-600 hover:underline"
                    >
                      + 添加时段
                    </button>
                  </div>
                  
                  {schedules.map((sched, idx) => (
                    <div key={sched.id} className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3 relative group/slot">
                      {schedules.length > 1 && (
                        <button 
                          onClick={() => removeSchedule(sched.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] text-purple-700 font-bold mb-1">开始时间</label>
                          <input 
                            type="time" 
                            value={sched.start}
                            onChange={(e) => updateSchedule(sched.id, 'start', e.target.value)}
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="pt-4 text-purple-300">-</div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-purple-700 font-bold mb-1">结束时间</label>
                          <input 
                            type="time" 
                            value={sched.end}
                            onChange={(e) => updateSchedule(sched.id, 'end', e.target.value)}
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-700 font-bold mb-2">重复周期 Repeat</label>
                        <div className="flex justify-between gap-1">
                          {weekDays.map((label, i) => (
                            <button
                              key={i}
                              onClick={() => toggleDay(sched.id, i)}
                              className={`w-8 h-8 rounded-full border text-[10px] font-bold transition-all ${
                                sched.days.includes(i) 
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold text-sm">取消</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95">保存设置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type RecentDevice = {
  mac: string;
  ip?: string;
  hostname?: string;
  lastSeenAt?: number;
  lastSeen?: string;
  online?: boolean;
};

type DevicePreset = {
  name?: string;
  deviceType?: string;
  model?: string;
  icon?: string;
};

const DEVICE_PRESETS_BY_MAC: Record<string, DevicePreset> = {
  '70:B3:D5:E2:B1:00': { name: '小米电视 4S (客厅)', deviceType: '电视', model: 'Xiaomi TV 4S', icon: 'fa-tv' },
  'AC:BC:32:00:FF:12': { name: 'iPad Pro (小明)', deviceType: '平板', model: 'iPad Pro', icon: 'fa-tablet-screen-button' },
};

const DEVICE_PRESETS_BY_OUI: Record<string, DevicePreset> = {
  'DC:A6:32': { deviceType: '手机', model: 'Xiaomi', icon: 'fa-mobile-screen' },
  'D0:03:4B': { deviceType: '电视', model: 'Xiaomi TV', icon: 'fa-tv' },
  'F4:F5:D8': { deviceType: '手机', model: 'Huawei', icon: 'fa-mobile-screen' },
  '3C:5A:B4': { deviceType: '电脑', model: 'Apple Mac', icon: 'fa-laptop' },
  'A4:5E:60': { deviceType: '平板', model: 'Apple iPad', icon: 'fa-tablet-screen-button' },
};

const normalizeMac = (mac: string) => mac.trim().toUpperCase().replace(/-/g, ':');

const formatLastSeen = (d: RecentDevice) => {
  if (d.lastSeenAt) return new Date(d.lastSeenAt * 1000).toLocaleString();
  if (d.lastSeen) return d.lastSeen;
  return '';
};

const isWithinDays = (lastSeenAtSeconds: number | undefined, days: number) => {
  if (!lastSeenAtSeconds) return false;
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;
  return lastSeenAtSeconds * 1000 >= cutoffMs;
};

const getPreset = (mac: string): DevicePreset => {
  const normalized = normalizeMac(mac);
  const byMac = DEVICE_PRESETS_BY_MAC[normalized];
  if (byMac) return byMac;
  const oui = normalized.split(':').slice(0, 3).join(':');
  return DEVICE_PRESETS_BY_OUI[oui] || {};
};

const mockRecentDevices = (): RecentDevice[] => {
  const now = Math.floor(Date.now() / 1000);
  const samples: RecentDevice[] = [
    { mac: '70:B3:D5:E2:B1:00', ip: '192.168.1.100', hostname: 'xiaomi-tv', lastSeenAt: now - 60, online: true },
    { mac: 'AC:BC:32:00:FF:12', ip: '192.168.1.88', hostname: 'ipad-pro', lastSeenAt: now - 12 * 60, online: true },
    { mac: '3C:5A:B4:11:22:33', ip: '192.168.1.30', hostname: 'macbook', lastSeenAt: now - 2 * 24 * 60 * 60, online: false },
    { mac: 'F4:F5:D8:AA:BB:CC', ip: '192.168.1.56', hostname: 'huawei', lastSeenAt: now - 6 * 24 * 60 * 60, online: false },
  ];
  return samples.filter(d => isWithinDays(d.lastSeenAt, 7));
};

interface NetworkDeviceListProps {
  controlledDevices: Device[];
  platforms: Platform[];
  onAddControlledDevice: (device: Device) => void;
}

export const NetworkDeviceList: React.FC<NetworkDeviceListProps> = ({ controlledDevices, platforms, onAddControlledDevice }) => {
  const [devices, setDevices] = useState<RecentDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [mode, setMode] = useState<ControlMode>(ControlMode.QUOTA);
  const [quotaMins, setQuotaMins] = useState(60);
  const [schedules, setSchedules] = useState<ScheduleWindow[]>([]);
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [selectedRecent, setSelectedRecent] = useState<RecentDevice | null>(null);

  const validateMac = (val: string) => {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(val);
  };

  const loadDevices = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/cgi-bin/luci/admin/services/mybaby/api/recent_devices', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RecentDevice[];
      const normalized = Array.isArray(data) ? data : [];
      setDevices(normalized.filter(d => isWithinDays(d.lastSeenAt, 7)));
    } catch (e: any) {
      setDevices(mockRecentDevices());
      setLoadError('当前环境无法读取路由器设备信息，已展示演示数据。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const prefillMac = selectedRecent?.mac ? normalizeMac(selectedRecent.mac) : '';
    const preset = prefillMac ? getPreset(prefillMac) : {};
    setMac(prefillMac);
    setName(preset.name || selectedRecent?.hostname || prefillMac);
    setMode(ControlMode.QUOTA);
    setQuotaMins(60);
    setSchedules([{ id: Date.now().toString(), start: '18:30', end: '20:00', days: [1, 2, 3, 4, 5] }]);
    setSelectedPlatformIds(platforms.filter(p => p.enabled).map(p => p.id));
    setError('');
  }, [isModalOpen, selectedRecent, platforms]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const addSchedule = () => {
    setSchedules([...schedules, { id: Date.now().toString(), start: '09:00', end: '10:00', days: [1, 2, 3, 4, 5] }]);
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const updateSchedule = (id: string, field: keyof ScheduleWindow, value: any) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleDay = (scheduleId: string, dayIndex: number) => {
    setSchedules(schedules.map(s => {
      if (s.id === scheduleId) {
        const newDays = s.days.includes(dayIndex) ? s.days.filter(d => d !== dayIndex) : [...s.days, dayIndex];
        return { ...s, days: newDays };
      }
      return s;
    }));
  };

  const togglePlatformSelection = (id: string) => {
    setSelectedPlatformIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const openAddModal = (d: RecentDevice) => {
    setSelectedRecent(d);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return setError('请输入设备名称');
    if (!mac.trim()) return setError('请输入 MAC 地址');
    if (!validateMac(mac)) return setError('MAC 地址格式不正确 (支持 : 或 -)');

    const lastSeen = selectedRecent ? formatLastSeen(selectedRecent) : new Date().toLocaleString();
    const status: Device['status'] = selectedRecent?.online ? 'online' : 'offline';

    const deviceData: Device = {
      id: `d-${Date.now()}`,
      name,
      mac: normalizeMac(mac),
      mode,
      platformIds: selectedPlatformIds,
      timeUsedToday: 0,
      status,
      lastSeen: lastSeen || new Date().toLocaleString(),
      quota: mode === ControlMode.QUOTA ? { weekdayLimitMinutes: quotaMins, weekendLimitMinutes: quotaMins } : undefined,
      schedules: mode === ControlMode.SCHEDULE ? schedules : undefined
    };

    onAddControlledDevice(deviceData);
    setIsModalOpen(false);
  };

  const controlledMacSet = new Set(controlledDevices.map(d => normalizeMac(d.mac)));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">设备列表（最近 7 天） / Recent Devices</h3>
            <p className="text-xs text-slate-400 mt-1">自动汇总 DHCP/ARP 记录，展示最近连接过的设备</p>
          </div>
          <button
            type="button"
            onClick={loadDevices}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-900 shadow-md transition-all active:scale-95"
          >
            <i className="fa-solid fa-rotate-right"></i> 刷新 Refresh
          </button>
        </div>

        {loadError && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs flex items-center gap-2">
            <i className="fa-solid fa-circle-info"></i>
            {loadError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">设备</th>
                <th className="px-6 py-4">类型</th>
                <th className="px-6 py-4">型号</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">MAC</th>
                <th className="px-6 py-4">最后一次 / 状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-6 py-10 text-slate-400 text-sm" colSpan={7}>加载中...</td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-slate-400 text-sm" colSpan={7}>暂无最近 7 天内的设备记录</td>
                </tr>
              ) : (
                devices.map(d => {
                  const macNorm = normalizeMac(d.mac);
                  const preset = getPreset(macNorm);
                  const displayName = preset.name || d.hostname || macNorm;
                  const deviceType = preset.deviceType || '-';
                  const model = preset.model || '-';
                  const icon = preset.icon || 'fa-network-wired';
                  const online = !!d.online;
                  const alreadyControlled = controlledMacSet.has(macNorm);
                  return (
                    <tr key={macNorm} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-lg">
                            <i className={`fa-solid ${icon}`}></i>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{displayName}</p>
                            {d.hostname && (
                              <p className="text-xs text-slate-400">{d.hostname}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{deviceType}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{model}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{d.ip || '-'}</td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono">
                          {macNorm}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">{formatLastSeen(d)}</p>
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase ${online ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                            {online ? 'online' : 'offline'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={alreadyControlled}
                            onClick={() => openAddModal(d)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              alreadyControlled
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                            }`}
                          >
                            {alreadyControlled ? '已受控' : '加入管控'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">加入受控设备</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 italic">设备名称 Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：客厅小米电视"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 italic">MAC 地址 MAC Address *</label>
                <input
                  type="text"
                  value={mac}
                  readOnly
                  className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg outline-none font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 italic">控制模式 Control Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode(ControlMode.QUOTA)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${mode === ControlMode.QUOTA ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'}`}
                  >
                    累计时长 Quota
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode(ControlMode.SCHEDULE)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${mode === ControlMode.SCHEDULE ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-purple-300'}`}
                  >
                    固定时段 Fixed Slots
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 italic">控制规则 / Platforms</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {platforms.map((p) => {
                    const checked = selectedPlatformIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePlatformSelection(p.id)}
                        className={`px-3 py-2 rounded-lg border text-left text-sm font-bold flex items-center gap-2 transition-all ${
                          checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <i className={`fa-solid ${p.icon}`}></i>
                        <span className="truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {mode === ControlMode.QUOTA ? (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <label className="block text-xs font-bold text-blue-700 uppercase italic">每日配额 (分钟)</label>
                  <input
                    type="number"
                    value={quotaMins}
                    onChange={(e) => setQuotaMins(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <p className="text-[10px] text-blue-600 italic">到达配额后将对受限平台进行拦截。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase italic">活跃时间段 Fixed Slots</label>
                    <button type="button" onClick={addSchedule} className="text-xs font-bold text-purple-600 hover:underline">
                      + 添加时段
                    </button>
                  </div>

                  {schedules.map((sched) => (
                    <div key={sched.id} className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 space-y-3 relative">
                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSchedule(sched.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] text-purple-700 font-bold mb-1">开始时间</label>
                          <input
                            type="time"
                            value={sched.start}
                            onChange={(e) => updateSchedule(sched.id, 'start', e.target.value)}
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm"
                          />
                        </div>
                        <div className="pt-4 text-purple-300">-</div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-purple-700 font-bold mb-1">结束时间</label>
                          <input
                            type="time"
                            value={sched.end}
                            onChange={(e) => updateSchedule(sched.id, 'end', e.target.value)}
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-700 font-bold mb-2">重复周期 Repeat</label>
                        <div className="flex justify-between gap-1">
                          {weekDays.map((label, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => toggleDay(sched.id, i)}
                              className={`w-8 h-8 rounded-full border text-[10px] font-bold transition-all ${
                                sched.days.includes(i) ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-slate-400 border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold text-sm">取消</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95">保存设置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceList;
