
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-line', label: '概览 / Overview' },
    { id: 'devices', icon: 'fa-laptop-code', label: '设备 / Devices' },
    { id: 'platforms', icon: 'fa-shield-halved', label: '限制规则 / Rules' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <i className="fa-solid fa-baby"></i>
        </div>
        <span className="text-xl font-bold text-white">熊孩子/mybaby</span>
      </div>
      
      <nav className="flex-1 mt-6 px-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 text-xs">
          <p className="text-slate-500 mb-1">Version: 1.2.0-stable</p>
          <p className="text-slate-500">Author: OpenSource Family</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
