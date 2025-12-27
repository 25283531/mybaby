
import React from 'react';
import { Device, Platform } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface DashboardProps {
  devices: Device[];
  logs: string[];
  platforms: Platform[];
}

const Dashboard: React.FC<DashboardProps> = ({ devices, logs, platforms }) => {
  const stats = [
    { label: '受控设备 / Devices', value: devices.length, icon: 'fa-laptop', color: 'bg-blue-500' },
    { label: '在线状态 / Online', value: devices.filter(d => d.status === 'online').length, icon: 'fa-wifi', color: 'bg-green-500' },
    { label: '已拦截 / Blocked', value: devices.filter(d => d.status === 'blocked').length, icon: 'fa-shield-halved', color: 'bg-red-500' },
    { label: '拦截次数 (Today)', value: '1,248', icon: 'fa-ban', color: 'bg-orange-500' },
  ];

  // Mock data for usage chart
  const usageData = [
    { name: '06:00', usage: 10 },
    { name: '08:00', usage: 45 },
    { name: '10:00', usage: 30 },
    { name: '12:00', usage: 120 },
    { name: '14:00', usage: 80 },
    { name: '16:00', usage: 60 },
    { name: '18:00', usage: 190 },
    { name: '20:00', usage: 240 },
    { name: '22:00', usage: 110 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Usage Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">今日总流量趋势 / Traffic Trend</h3>
            <select className="text-sm bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
              <option>最近 24 小时</option>
              <option>最近 7 天</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">拦截分类 / Block Share</h3>
          <div className="space-y-4">
            {platforms.map(p => (
              <div key={p.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">{p.name}</span>
                  <span className="text-slate-400">42%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${p.enabled ? 'bg-blue-500' : 'bg-slate-300'}`} style={{width: `${p.enabled ? 42 : 10}%`}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">实时日志 / Live Logs</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-500 py-1 border-b border-slate-50 last:border-0">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
