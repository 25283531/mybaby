
export enum ControlMode {
  QUOTA = 'QUOTA', // Daily cumulative time
  SCHEDULE = 'SCHEDULE', // Fixed time windows
}

export interface ScheduleWindow {
  id: string;
  start: string; // HH:mm
  end: string; // HH:mm
  days: number[]; // 0-6 (Sun-Sat)
}

export interface QuotaConfig {
  weekdayLimitMinutes: number;
  weekendLimitMinutes: number;
}

export interface Device {
  id: string;
  mac: string;
  name: string;
  mode: ControlMode;
  quota?: QuotaConfig;
  schedules?: ScheduleWindow[];
  timeUsedToday: number; // in minutes
  status: 'online' | 'offline' | 'blocked';
  lastSeen: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  domains: string[];
  enabled: boolean;
}

export interface PluginState {
  enabled: boolean;
  ipv6Support: boolean;
  devices: Device[];
  platforms: Platform[];
  systemLogs: string[];
}
