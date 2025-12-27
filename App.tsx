
import React, { useState } from 'react';
import { Device, Platform, PluginState } from './types';
import { INITIAL_DEVICES, INITIAL_PLATFORMS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DeviceList from './components/DeviceList';
import PlatformManager from './components/PlatformManager';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'platforms'>('dashboard');
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          pluginEnabled={pluginState.enabled} 
          togglePlugin={togglePlugin} 
          ipv6Support={pluginState.ipv6Support}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <Dashboard 
                devices={pluginState.devices} 
                logs={pluginState.systemLogs}
                platforms={pluginState.platforms}
              />
            )}
            
            {activeTab === 'devices' && (
              <DeviceList 
                devices={pluginState.devices} 
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
      </div>
    </div>
  );
};

export default App;
