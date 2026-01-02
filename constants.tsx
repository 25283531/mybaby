
import React from 'react';

export const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  bg: '#f8fafc',
};

export const INITIAL_PLATFORMS = [
  { id: '1', name: '抖音 (Douyin/TikTok)', icon: 'fa-video', domains: ['*.douyin.com', '*.snssdk.com', '*.amemv.com'], enabled: true },
  { id: '2', name: '快手 (Kuaishou)', icon: 'fa-camera-retro', domains: ['*.kuaishou.com', '*.gifshow.com'], enabled: true },
  { id: '3', name: 'Bilibili', icon: 'fa-tv', domains: ['*.bilibili.com', '*.hdslb.com'], enabled: true },
  { id: '4', name: '王者荣耀 (Honor of Kings)', icon: 'fa-gamepad', domains: ['*.qq.com', '*.tencent.com'], enabled: false },
];

export const INITIAL_DEVICES = [
  {
    id: 'd1',
    mac: '70:B3:D5:E2:B1:00',
    name: "小米电视 4S (客厅)",
    mode: 'QUOTA',
    platformIds: ['1', '2', '3'],
    quota: { weekdayLimitMinutes: 60, weekendLimitMinutes: 120 },
    timeUsedToday: 45,
    status: 'online',
    lastSeen: '2023-10-27 10:30:00'
  },
  {
    id: 'd2',
    mac: 'AC:BC:32:00:FF:12',
    name: "iPad Pro (小明)",
    mode: 'SCHEDULE',
    platformIds: ['1', '2', '3'],
    schedules: [
      { id: 's1', start: '18:30', end: '20:00', days: [1, 2, 3, 4, 5] },
      { id: 's2', start: '10:00', end: '12:00', days: [0, 6] }
    ],
    timeUsedToday: 15,
    status: 'blocked',
    lastSeen: '2023-10-27 11:15:00'
  }
];
