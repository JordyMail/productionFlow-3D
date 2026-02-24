import { useState } from 'react';
import { 
  Plus, 
  Link2, 
  Play, 
  Pause, 
  RotateCcw,
  Activity,
  Settings,
  Package,
  ArrowRightLeft,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMachineStore } from '@/store/machineStore';

interface ToolbarProps {
  onSimulate?: () => void;
  isSimulating?: boolean;
}

export function Toolbar({ onSimulate, isSimulating = false }: ToolbarProps) {
  const { machines, addMachine } = useMachineStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState<string | null>(null);
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'processor' as const,
    x: 0,
    z: 0
  });

  const handleAddMachine = () => {
    if (!newMachine.name) return;
    
    addMachine({
      name: newMachine.name,
      type: newMachine.type,
      status: 'idle',
      throughput: 0,
      position: [newMachine.x, 0, newMachine.z],
      description: ''
    });
    
    setNewMachine({ name: '', type: 'processor', x: 0, z: 0 });
    setIsAddDialogOpen(false);
  };

  const handleConnectClick = () => {
    if (!isConnectMode) {
      setIsConnectMode(true);
      setConnectSource(null);
    } else {
      setIsConnectMode(false);
      setConnectSource(null);
    }
  };

  const activeMachines = machines.filter(m => m.status === 'active').length;
  const totalThroughput = machines.reduce((sum, m) => sum + m.throughput, 0);

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between">
      {/* Left Section - Logo & Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">Flow 3D</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            {activeMachines} Active
          </Badge>
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            {totalThroughput} units/hr
          </Badge>
        </div>
      </div>

      {/* Center Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Add Machine Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new machine to the production line
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Machine Name</Label>
                <Input
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  placeholder="e.g., Assembly Unit C"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Machine Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'conveyor', label: 'Conveyor', icon: ArrowRightLeft },
                    { value: 'processor', label: 'Processor', icon: Settings },
                    { value: 'packer', label: 'Packer', icon: Package },
                    { value: 'quality', label: 'Quality', icon: Activity },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewMachine({ ...newMachine, type: type.value as any })}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                        newMachine.type === type.value
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position X</Label>
                  <Input
                    type="number"
                    value={newMachine.x}
                    onChange={(e) => setNewMachine({ ...newMachine, x: Number(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position Z</Label>
                  <Input
                    type="number"
                    value={newMachine.z}
                    onChange={(e) => setNewMachine({ ...newMachine, z: Number(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <Button onClick={handleAddMachine} className="w-full bg-blue-600 hover:bg-blue-700">
                Add Machine
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Connect Button */}
        <Button
          variant={isConnectMode ? "default" : "outline"}
          size="sm"
          onClick={handleConnectClick}
          className={isConnectMode ? "bg-amber-600 hover:bg-amber-700" : "border-slate-700 text-slate-300 hover:text-white"}
        >
          <Link2 className="w-4 h-4 mr-2" />
          {isConnectMode ? 'Select Target' : 'Connect'}
        </Button>

        {isConnectMode && (
          <Badge className="bg-amber-600 text-white">
            {connectSource ? 'Select target machine' : 'Select source machine'}
          </Badge>
        )}

        <div className="w-px h-6 bg-slate-700 mx-2" />

        {/* Simulation Controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSimulate}
          className={isSimulating ? "border-green-700 text-green-400" : "border-slate-700 text-slate-300"}
        >
          {isSimulating ? (
            <><Pause className="w-4 h-4 mr-2" /> Stop Sim</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Simulate</>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => useMachineStore.getState().loadInitialData()}
          className="border-slate-700 text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Right Section - Search & Settings */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search machines..."
            className="pl-9 w-48 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Settings className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-white">
            <DropdownMenuItem className="hover:bg-slate-700">Export Layout</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-700">Import Layout</DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-slate-700">Clear All</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default Toolbar;
