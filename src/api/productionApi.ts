/**
 * ============================================
 * PRODUCTION API INTEGRATION
 * ============================================
 * 
 * This module provides functions to connect the ProdFlow 3D
 * dashboard with real-time production data from your backend API.
 */

import type { MachineStatus } from '@/types/machine';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const POLLING_INTERVAL = 5000; // 5 seconds

// Types for API responses
export interface APIMachineData {
  id: string;
  status: MachineStatus;
  throughput: number;
  efficiency?: number;
  temperature?: number;
  vibration?: number;
  timestamp: string;
}

export interface APIProductionResponse {
  timestamp: string;
  lineId: string;
  machines: APIMachineData[];
  metrics?: {
    totalThroughput: number;
    averageEfficiency: number;
    overallEquipmentEffectiveness: number;
  };
}

// ============================================
// FETCH FUNCTIONS
// ============================================

/**
 * Fetch current production data for all machines
 */
export async function fetchProductionData(): Promise<APIProductionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/production/current`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch production data:', error);
    throw error;
  }
}

/**
 * Fetch data for a specific machine
 */
export async function fetchMachineData(machineId: string): Promise<APIMachineData> {
  try {
    const response = await fetch(`${API_BASE_URL}/machines/${machineId}/status`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch data for machine ${machineId}:`, error);
    throw error;
  }
}

/**
 * Fetch historical data for analytics
 */
export async function fetchMachineHistory(
  machineId: string,
  startTime: string,
  endTime: string
): Promise<APIMachineData[]> {
  try {
    const params = new URLSearchParams({ startTime, endTime });
    const response = await fetch(
      `${API_BASE_URL}/machines/${machineId}/history?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch history for machine ${machineId}:`, error);
    throw error;
  }
}

// ============================================
// WEBSOCKET CONNECTION (Real-time updates)
// ============================================

export class ProductionWebSocket {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 3000;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private onDataCallback: ((data: APIProductionResponse) => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  constructor(
    onData: (data: APIProductionResponse) => void,
    onError?: (error: Event) => void
  ) {
    this.onDataCallback = onData;
    this.onErrorCallback = onError || null;
  }

  connect() {
    const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/production';
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data: APIProductionResponse = JSON.parse(event.data);
        this.onDataCallback?.(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onErrorCallback?.(error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  send(message: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

// ============================================
// POLLING ALTERNATIVE (For servers without WebSocket)
// ============================================

export class ProductionPoller {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onDataCallback: ((data: APIProductionResponse) => void) | null = null;
  private onErrorCallback: ((error: Error) => void) | null = null;

  constructor(
    onData: (data: APIProductionResponse) => void,
    onError?: (error: Error) => void
  ) {
    this.onDataCallback = onData;
    this.onErrorCallback = onError || null;
  }

  start(interval: number = POLLING_INTERVAL) {
    this.fetchData(); // Initial fetch
    this.intervalId = setInterval(() => this.fetchData(), interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async fetchData() {
    try {
      const data = await fetchProductionData();
      this.onDataCallback?.(data);
    } catch (error) {
      this.onErrorCallback?.(error as Error);
    }
  }
}

// ============================================
// INTEGRATION HOOK (For React components)
// ============================================

import { useEffect, useRef, useCallback } from 'react';
import { useMachineStore } from '@/store/machineStore';

export function useProductionDataRealtime(useWebSocket: boolean = false) {
  const { batchUpdateFromProductionData } = useMachineStore();
  const wsRef = useRef<ProductionWebSocket | null>(null);
  const pollerRef = useRef<ProductionPoller | null>(null);

  const handleData = useCallback((data: APIProductionResponse) => {
    // Transform API data to store format
    const updates = data.machines.map((m) => ({
      id: m.id,
      status: m.status,
      throughput: m.throughput
    }));

    // Update the store
    batchUpdateFromProductionData(updates);
  }, [batchUpdateFromProductionData]);

  const handleError = useCallback((error: Error | Event) => {
    console.error('Production data connection error:', error);
  }, []);

  useEffect(() => {
    if (useWebSocket) {
      // Use WebSocket for real-time updates
      wsRef.current = new ProductionWebSocket(handleData, handleError);
      wsRef.current.connect();
    } else {
      // Use polling as fallback
      pollerRef.current = new ProductionPoller(handleData, handleError);
      pollerRef.current.start();
    }

    return () => {
      pollerRef.current?.stop();
      wsRef.current?.disconnect();
    };
  }, [useWebSocket, handleData, handleError]);

  return {
    isConnected: !!(wsRef.current || pollerRef.current)
  };
}

export default {
  fetchProductionData,
  fetchMachineData,
  fetchMachineHistory,
  ProductionWebSocket,
  ProductionPoller,
  useProductionDataRealtime
};
