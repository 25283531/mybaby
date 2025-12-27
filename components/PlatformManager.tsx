
import React, { useState, useEffect } from 'react';
import { Platform } from '../types';

interface PlatformManagerProps {
  platforms: Platform[];
  onToggle: (id: string) => void;
  onAdd: (platform: Platform) => void;
  onUpdate: (platform: Platform) => void;
  onDelete: (id: string) => void;
}

const PlatformManager: React.FC<PlatformManagerProps> = ({ platforms, onToggle, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleDomains, setRuleDomains] = useState('');
  
  // Track which platform is currently in "Confirm Delete" state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync modal state with editing platform
  useEffect(() => {
    if (editingPlatform) {
      setRuleName(editingPlatform.name);
      setRuleDomains(editingPlatform.domains.join('\n'));
    } else {
      setRuleName('');
      setRuleDomains('');
    }
  }, [editingPlatform, isModalOpen]);

  const handleOpenAdd = () => {
    setEditingPlatform(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setIsModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!ruleName.trim() || !ruleDomains.trim()) return;

    const domainList = ruleDomains.split('\n').filter(d => d.trim()).map(d => d.trim());
    
    if (editingPlatform) {
      onUpdate({
        ...editingPlatform,
        name: ruleName,
        domains: domainList
      });
    } else {
      const newPlatform: Platform = {
        id: `p-${Date.now()}`,
        name: ruleName,
        icon: 'fa-globe',
        domains: domainList,
        enabled: true
      };
      onAdd(newPlatform);
    }

    setIsModalOpen(false);
    setRuleName('');
    setRuleDomains('');
  };

  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmDeleteId === id) {
      // Second click - perform actual delete
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      // First click - enter confirmation state
      setConfirmDeleteId(id);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDeleteId(prev => prev === id ? null : prev);
      }, 3000);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-xl font-bold text-slate-800">限制规则合集 / Restriction Rules Collection</h3>
          <p className="text-sm text-slate-500">选择需要限制的视频、游戏或应用平台规则</p>
        </div>
        <button 
          type="button"
          onClick={handleOpenAdd}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-900 shadow-md transition-all active:scale-95"
        >
          <i className="fa-solid fa-plus"></i> 自定义规则集 Custom Rule Set
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map(platform => (
          <div key={platform.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
            {/* Background Icon Decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 opacity-[0.03] transition-transform group-hover:scale-110 pointer-events-none`}>
              <i className={`fa-solid ${platform.icon} text-8xl`}></i>
            </div>
            
            <div className="flex items-start justify-between relative z-30">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${
                  platform.enabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className={`fa-solid ${platform.icon}`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{platform.name}</h4>
                  <p className="text-xs text-slate-400">{platform.domains.length} 个受限域名</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Status Toggle Switch */}
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggle(platform.id); }}
                  className={`w-12 h-6 rounded-full transition-all relative shadow-inner cursor-pointer ${
                    platform.enabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${
                    platform.enabled ? 'left-7' : 'left-1'
                  }`}></div>
                </button>

                {/* Direct Confirmable Delete Button */}
                <button 
                  type="button"
                  onClick={(e) => initiateDelete(e, platform.id)}
                  onMouseLeave={() => confirmDeleteId === platform.id && setConfirmDeleteId(null)}
                  className={`h-9 flex items-center justify-center rounded-lg transition-all border shadow-sm cursor-pointer whitespace-nowrap overflow-hidden ${
                    confirmDeleteId === platform.id 
                    ? 'px-3 bg-red-600 text-white border-red-700 w-auto' 
                    : 'w-9 bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white'
                  }`}
                  title={confirmDeleteId === platform.id ? "点击确认删除" : "删除规则"}
                >
                  {confirmDeleteId === platform.id ? (
                    <span className="text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                      确定删除？
                    </span>
                  ) : (
                    <i className="fa-solid fa-trash-can text-sm pointer-events-none"></i>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2 flex-1 relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">域名过滤规则 Domains</p>
              <div className="flex flex-wrap gap-2">
                {platform.domains.slice(0, 6).map((d, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-mono text-slate-600">
                    {d}
                  </span>
                ))}
                {platform.domains.length > 6 && (
                  <span className="text-[10px] text-slate-400 flex items-center">...及其他 {platform.domains.length - 6} 个</span>
                )}
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-slate-50 flex items-center justify-between relative z-30">
              <span className="text-[10px] text-slate-400 italic">基于 IP Set 动态识别</span>
              <button 
                type="button"
                onClick={() => handleOpenEdit(platform)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square"></i>
                编辑规则 Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
          <i className="fa-solid fa-circle-info"></i>
        </div>
        <div>
          <h4 className="font-bold text-blue-800 mb-1">技术提示 Technical Insight</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            本插件通过维护域名对应的 IP Set 来实现流量拦截。与 AdGuard Home 等方案不同，它在 <b>forward</b> 链进行 MAC + IP 的原子匹配，
            这意味着即使设备使用了自定义 DNS 或加密 DNS（DoH），只要流经路由器的流量目标 IP 在列表中，管控依然有效。
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="font-bold text-slate-800">{editingPlatform ? '编辑规则集' : '新增自定义规则集'}</h4>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 italic">规则名称 Rule Name</label>
                <input 
                  type="text" 
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="例如：微信视频号"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 italic">域名列表 (每行一个)</label>
                <textarea 
                  rows={6}
                  value={ruleDomains}
                  onChange={(e) => setRuleDomains(e.target.value)}
                  placeholder="*.wechat.com&#10;*.qq.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-mono text-sm leading-relaxed"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                <i className="fa-solid fa-triangle-exclamation text-sm"></i>
                <p className="text-xs">系统将自动定期解析这些域名并更新 nftables 集合，无需重启服务。</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold text-sm">取消</button>
              <button type="button" onClick={handleSaveRule} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 active:scale-95 transition-all">
                {editingPlatform ? '更新规则 Update' : '确认添加 Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformManager;
