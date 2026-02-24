export type MachineStatus = 'active' | 'idle' | 'stopped' | 'maintenance';

export interface Machine {
  id: string;
  name: string;
  status: MachineStatus;
  throughput: number;
  position: [number, number, number];
  type?: 'conveyor' | 'processor' | 'packer' | 'quality';
  description?: string;
}

export interface Connection {
  id: string;
  fromMachineId: string;
  toMachineId: string;
  flowRate?: number;
}

export interface ProductionData {
  timestamp: string;
  machines: {
    id: string;
    status: MachineStatus;
    throughput: number;
    efficiency: number;
  }[];
}

export const STATUS_COLORS: Record<MachineStatus, string> = {
  active: '#22c55e',    // Green
  idle: '#eab308',      // Yellow
  stopped: '#ef4444',   // Red
  maintenance: '#3b82f6' // Blue
};

export const STATUS_COLORS_EMISSIVE: Record<MachineStatus, string> = {
  active: '#14532d',
  idle: '#713f12',
  stopped: '#7f1d1d',
  maintenance: '#1e3a8a'
};
