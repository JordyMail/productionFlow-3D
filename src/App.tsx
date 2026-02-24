import { useEffect } from 'react';
import { IsometricCanvas } from '@/components/IsometricCanvas';
import { MachineSidebar } from '@/components/MachineSidebar';
import { Toolbar } from '@/components/Toolbar';
import { useSimulation } from '@/hooks/useSimulation';
import { useMachineStore } from '@/store/machineStore';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const { isSimulating, toggleSimulation } = useSimulation({
    updateInterval: 1500,
    fluctuationRange: 15
  });
  
  const { loadInitialData } = useMachineStore();

  // Load initial data on app mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }}
      />
      
      {/* Toolbar */}
      <Toolbar 
        onSimulate={toggleSimulation}
        isSimulating={isSimulating}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Canvas */}
        <div className="flex-1 relative">
          <IsometricCanvas className="w-full h-full" />
        </div>
        
        {/* Sidebar */}
        <MachineSidebar />
      </div>
    </div>
  );
}

export default App;
