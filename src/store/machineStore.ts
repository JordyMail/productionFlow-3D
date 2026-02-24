import { create } from 'zustand';
import type { Machine, Connection, MachineStatus } from '@/types/machine';

interface MachineState {
  machines: Machine[];
  connections: Connection[];
  selectedMachineId: string | null;
  
  // CRUD Operations
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  selectMachine: (id: string | null) => void;
  
  // Connection Operations
  addConnection: (fromId: string, toId: string) => void;
  deleteConnection: (id: string) => void;
  
  // Real-time Data Updates
  updateMachineStatus: (id: string, status: MachineStatus) => void;
  updateMachineThroughput: (id: string, throughput: number) => void;
  batchUpdateFromProductionData: (data: { id: string; status: MachineStatus; throughput: number }[]) => void;
  
  // Initial Data
  loadInitialData: () => void;
}

export const useMachineStore = create<MachineState>((set, get) => ({
  machines: [],
  connections: [],
  selectedMachineId: null,

  addMachine: (machine) => {
    const id = `machine-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      machines: [...state.machines, { ...machine, id }]
    }));
  },

  updateMachine: (id, updates) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      )
    }));
  },

  deleteMachine: (id) => {
    set((state) => ({
      machines: state.machines.filter((m) => m.id !== id),
      connections: state.connections.filter(
        (c) => c.fromMachineId !== id && c.toMachineId !== id
      ),
      selectedMachineId: state.selectedMachineId === id ? null : state.selectedMachineId
    }));
  },

  selectMachine: (id) => {
    set({ selectedMachineId: id });
  },

  addConnection: (fromId, toId) => {
    if (fromId === toId) return;
    const exists = get().connections.some(
      (c) => c.fromMachineId === fromId && c.toMachineId === toId
    );
    if (exists) return;
    
    const id = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      connections: [...state.connections, { id, fromMachineId: fromId, toMachineId: toId }]
    }));
  },

  deleteConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id)
    }));
  },

  updateMachineStatus: (id, status) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id ? { ...m, status } : m
      )
    }));
  },

  updateMachineThroughput: (id, throughput) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id ? { ...m, throughput } : m
      )
    }));
  },

  batchUpdateFromProductionData: (data) => {
    set((state) => ({
      machines: state.machines.map((m) => {
        const update = data.find((d) => d.id === m.id);
        return update
          ? { ...m, status: update.status, throughput: update.throughput }
          : m;
      })
    }));
  },

  loadInitialData: () => {
    const initialMachines: Machine[] = [
      {
        id: 'machine-001',
        name: 'Raw Material Feeder',
        status: 'active',
        throughput: 120,
        position: [-6, 0, -4],
        type: 'conveyor',
        description: 'Feeder untuk bahan baku awal'
      },
      {
        id: 'machine-002',
        name: 'Pre-Processor A',
        status: 'active',
        throughput: 115,
        position: [-2, 0, -4],
        type: 'processor',
        description: 'Pra-pemrosesan bahan'
      },
      {
        id: 'machine-003',
        name: 'Main Processor',
        status: 'active',
        throughput: 110,
        position: [2, 0, -4],
        type: 'processor',
        description: 'Unit pemrosesan utama'
      },
      {
        id: 'machine-004',
        name: 'Quality Control',
        status: 'idle',
        throughput: 0,
        position: [6, 0, -4],
        type: 'quality',
        description: 'Pemeriksaan kualitas'
      },
      {
        id: 'machine-005',
        name: 'Packaging Unit',
        status: 'active',
        throughput: 105,
        position: [6, 0, 0],
        type: 'packer',
        description: 'Unit pengemasan'
      },
      {
        id: 'machine-006',
        name: 'Secondary Feeder',
        status: 'stopped',
        throughput: 0,
        position: [-6, 0, 0],
        type: 'conveyor',
        description: 'Feeder sekunder'
      },
      {
        id: 'machine-007',
        name: 'Auxiliary Processor',
        status: 'maintenance',
        throughput: 0,
        position: [-2, 0, 0],
        type: 'processor',
        description: 'Processor bantuan'
      },
      {
        id: 'machine-008',
        name: 'Final Inspection',
        status: 'active',
        throughput: 100,
        position: [2, 0, 0],
        type: 'quality',
        description: 'Inspeksi akhir'
      }
    ];

    const initialConnections: Connection[] = [
      { id: 'conn-001', fromMachineId: 'machine-001', toMachineId: 'machine-002' },
      { id: 'conn-002', fromMachineId: 'machine-002', toMachineId: 'machine-003' },
      { id: 'conn-003', fromMachineId: 'machine-003', toMachineId: 'machine-004' },
      { id: 'conn-004', fromMachineId: 'machine-004', toMachineId: 'machine-005' },
      { id: 'conn-005', fromMachineId: 'machine-006', toMachineId: 'machine-007' },
      { id: 'conn-006', fromMachineId: 'machine-007', toMachineId: 'machine-008' },
      { id: 'conn-007', fromMachineId: 'machine-008', toMachineId: 'machine-003' }
    ];

    set({ machines: initialMachines, connections: initialConnections });
  }
}));
