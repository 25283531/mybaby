
import React from 'react';

interface HeaderProps {
  pluginEnabled: boolean;
  togglePlugin: () => void;
  ipv6Support: boolean;
}

const Header: React.FC<HeaderProps> = ({ pluginEnabled, togglePlugin, ipv6Support }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 md:hidden">熊孩子</h2>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${pluginEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-sm font-semibold text-slate-600">
            {pluginEnabled ? '服务正在运行 / Running' : '服务已停止 / Stopped'}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
          <i className="fa-solid fa-network-wired"></i>
          {ipv6Support ? 'IPv4/v6 双栈保护' : '仅 IPv4'}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={togglePlugin}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            pluginEnabled 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
          }`}
        >
          {pluginEnabled ? '停止服务 Stop' : '启动服务 Start'}
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <button className="text-slate-500 hover:text-slate-800 transition-colors">
            <i className="fa-solid fa-bell"></i>
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
            <i className="fa-solid fa-user"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
