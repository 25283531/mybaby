
import React from 'react';

interface HeaderProps {
  pluginEnabled: boolean;
  togglePlugin: () => void;
  ipv6Support: boolean;
}

const Header: React.FC<HeaderProps> = ({ pluginEnabled, togglePlugin, ipv6Support }) => {
  return (
    <header className="bg-[#1a202c] text-white px-4 md:px-8 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fa-solid fa-baby text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">熊孩子/mybaby</h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Device Control Center</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4 border-l border-slate-700 pl-4 ml-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${pluginEnabled ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-red-500'}`}></span>
              <span className="text-xs font-bold text-slate-300">
                {pluginEnabled ? '服务运行中' : '服务未启用'}
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-800 text-blue-400 rounded-md text-[10px] font-black border border-slate-700">
              <i className="fa-solid fa-network-wired"></i>
              {ipv6Support ? 'IPV4/V6 DUAL-STACK' : 'IPV4 ONLY'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={togglePlugin}
            className={`px-5 py-2 rounded-lg font-black text-xs transition-all uppercase tracking-wider flex items-center gap-2 ${
              pluginEnabled 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
              : 'bg-green-600 text-white hover:bg-green-700 shadow-[0_4px_12px_rgba(22,163,74,0.3)] active:scale-95'
            }`}
          >
            <i className={`fa-solid ${pluginEnabled ? 'fa-power-off' : 'fa-play'}`}></i>
            {pluginEnabled ? '停止服务 Stop' : '启动服务 Start'}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-700 ml-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <i className="fa-solid fa-circle-question"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
