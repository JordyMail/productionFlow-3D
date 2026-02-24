import { useCallback, useEffect, useRef, useState } from 'react';
import { useMachineStore } from '@/store/machineStore';
import type { MachineStatus } from '@/types/machine';

interface SimulationConfig {
  updateInterval: number;
  fluctuationRange: number;
}

const defaultConfig: SimulationConfig = {
  updateInterval: 2000, // 2 seconds
  fluctuationRange: 10  // +/- 10 units
};

export function useSimulation(config: Partial<SimulationConfig> = {}) {
  const { updateMachineThroughput, updateMachineStatus, machines } = useMachineStore();
  const [isSimulating, setIsSimulating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const finalConfig = { ...defaultConfig, ...config };

  const generateRandomStatus = (): MachineStatus => {
    const rand = Math.random();
    if (rand > 0.85) return 'maintenance';
    if (rand > 0.7) return 'idle';
    if (rand > 0.6) return 'stopped';
    return 'active';
  };

  const simulateStep = useCallback(() => {
    machines.forEach((machine) => {
      // Randomly change status (10% chance)
      if (Math.random() < 0.1) {
        const newStatus = generateRandomStatus();
        updateMachineStatus(machine.id, newStatus);
        
        // If stopped or maintenance, set throughput to 0
        if (newStatus === 'stopped' || newStatus === 'maintenance') {
          updateMachineThroughput(machine.id, 0);
          return;
        }
        
        // If idle, reduce throughput
        if (newStatus === 'idle') {
          updateMachineThroughput(machine.id, Math.floor(machine.throughput * 0.3));
          return;
        }
      }

      // Fluctuate throughput for active machines
      if (machine.status === 'active') {
        const fluctuation = Math.floor(Math.random() * finalConfig.fluctuationRange * 2) - finalConfig.fluctuationRange;
        const newThroughput = Math.max(0, machine.throughput + fluctuation);
        updateMachineThroughput(machine.id, newThroughput);
      }
    });
  }, [machines, updateMachineThroughput, updateMachineStatus, finalConfig.fluctuationRange]);

  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;
    
    setIsSimulating(true);
    intervalRef.current = setInterval(simulateStep, finalConfig.updateInterval);
  }, [simulateStep, finalConfig.updateInterval]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  const toggleSimulation = useCallback(() => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  }, [isSimulating, startSimulation, stopSimulation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isSimulating,
    startSimulation,
    stopSimulation,
    toggleSimulation
  };
}

export default useSimulation;
