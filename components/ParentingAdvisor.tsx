
import React, { useState } from 'react';
import { Device, Platform } from '../types';
import { getParentingAdvice } from '../services/geminiService';

interface ParentingAdvisorProps {
  devices: Device[];
  platforms: Platform[];
}

const ParentingAdvisor: React.FC<ParentingAdvisorProps> = ({ devices, platforms }) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async (device: Device) => {
    setSelectedDevice(device);
    setLoading(true);
    setAdvice(null);
    try {
      const result = await getParentingAdvice(device, platforms);
      setAdvice(result || "Could not generate advice at this time.");
    } catch (e) {
      setAdvice("Error connecting to Gemini. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
          <i className="fa-solid fa-robot text-9xl"></i>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">AI 育儿助手 / Parenting Advisor</h2>
          <p className="text-blue-100 leading-relaxed">
            基于 Gemini 强大的逻辑分析能力，为您提供定制化的上网时长建议与家庭教育指导。
            不仅仅是拦截，更是帮助孩子建立健康的数字生活习惯。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-slate-800">选择分析对象 Select Device</h3>
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => handleGetAdvice(device)}
              disabled={loading}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                selectedDevice?.id === device.id 
                ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-100' 
                : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedDevice?.id === device.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <i className="fa-solid fa-laptop"></i>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{device.name}</p>
                  <p className="text-xs text-slate-500">已使用 {device.timeUsedToday} 分钟</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {selectedDevice ? `对 ${selectedDevice.name} 的分析建议` : '分析结果 Analysis Result'}
              </h3>
              {loading && <i className="fa-solid fa-circle-notch fa-spin text-blue-600"></i>}
            </div>
            
            <div className="flex-1 p-6">
              {!selectedDevice && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-2xl">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <p className="max-w-xs">从左侧选择一个设备，让 Gemini 为您提供专业的育儿建议和流量配额指导。</p>
                </div>
              )}

              {loading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-24 bg-slate-50 rounded mt-8"></div>
                </div>
              )}

              {advice && !loading && (
                <div className="prose prose-slate max-w-none animate-fadeIn">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                      <i className="fa-solid fa-sparkles"></i>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {advice}
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-800 mb-1">推荐修改建议 Suggested Change</p>
                      <p className="text-sm text-indigo-700">根据分析，建议将每日累计时长从 60 分钟调整为 45 分钟。</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm">
                      一键应用 Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentingAdvisor;
