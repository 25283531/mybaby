
import React, { useState } from 'react';
import { Device, Platform, PluginState } from './types';
import { INITIAL_DEVICES, INITIAL_PLATFORMS } from './constants';
import Header from './components/Header';
import DeviceList, { NetworkDeviceList } from './components/DeviceList';
import PlatformManager from './components/PlatformManager';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'device-list' | 'devices' | 'platforms'>('dashboard');
  const [pluginState, setPluginState] = useState<PluginState>({
    enabled: true,
    ipv6Support: true,
    devices: INITIAL_DEVICES as Device[],
    platforms: INITIAL_PLATFORMS as Platform[],
    systemLogs: [
      "[INFO] Plugin started successfully",
      "[INFO] nftables inet table 'tv_limit' initialized",
      "[DEBUG] Updated IP sets for 'Douyin'",
      "[INFO] Device 70:B3:D5:E2:B1:00 online"
    ]
  });

  const togglePlugin = () => {
    setPluginState(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateDevice = (updatedDevice: Device) => {
    setPluginState(prev => ({
      ...prev,
      devices: prev.devices.map(d => d.id === updatedDevice.id ? updatedDevice : d)
    }));
  };

  const addDevice = (newDevice: Device) => {
    setPluginState(prev => ({
      ...prev,
      devices: [newDevice, ...prev.devices]
    }));
  };

  const deleteDevice = (id: string) => {
    setPluginState(prev => ({
      ...prev,
      devices: prev.devices.filter(d => d.id !== id)
    }));
  };

  const togglePlatform = (id: string) => {
    setPluginState(prev => ({
      ...prev,
      platforms: prev.platforms.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const addPlatform = (newPlatform: Platform) => {
    setPluginState(prev => ({
      ...prev,
      platforms: [newPlatform, ...prev.platforms]
    }));
  };

  const updatePlatform = (updatedPlatform: Platform) => {
    setPluginState(prev => ({
      ...prev,
      platforms: prev.platforms.map(p => p.id === updatedPlatform.id ? updatedPlatform : p)
    }));
  };

  const deletePlatform = (id: string) => {
    setPluginState(prev => ({
      ...prev,
      platforms: prev.platforms.filter(p => p.id !== id)
    }));
  };

  const navItems = [
    { id: 'dashboard', label: '运行概览', icon: 'fa-chart-pie' },
    { id: 'device-list', label: '设备列表', icon: 'fa-list-ul' },
    { id: 'devices', label: '受控设备', icon: 'fa-laptop' },
    { id: 'platforms', label: '限制规则', icon: 'fa-shield-halved' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col">
      <Header 
        pluginEnabled={pluginState.enabled} 
        togglePlugin={togglePlugin} 
        ipv6Support={pluginState.ipv6Support}
      />
      
      {/* Top Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex -mb-px space-x-8 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all flex items-center gap-2
                  ${activeTab === item.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                `}
              >
                <i className={`fa-solid ${item.icon} text-[14px]`}></i>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              devices={pluginState.devices} 
              logs={pluginState.systemLogs}
              platforms={pluginState.platforms}
            />
          )}

          {activeTab === 'device-list' && (
            <NetworkDeviceList
              controlledDevices={pluginState.devices}
              platforms={pluginState.platforms}
              onAddControlledDevice={addDevice}
            />
          )}
          
          {activeTab === 'devices' && (
            <DeviceList 
              devices={pluginState.devices} 
              platforms={pluginState.platforms}
              onUpdate={updateDevice}
              onAdd={addDevice}
              onDelete={deleteDevice}
            />
          )}
          
          {activeTab === 'platforms' && (
            <PlatformManager 
              platforms={pluginState.platforms} 
              onToggle={togglePlatform}
              onAdd={addPlatform}
              onUpdate={updatePlatform}
              onDelete={deletePlatform}
            />
          )}
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-slate-400 text-xs">
        <p>熊孩子/mybaby Control Center &copy; 2024 - 基于 OpenWrt nftables 的家长控制系统</p>
      </footer>
    </div>
  );
};

export default App;
