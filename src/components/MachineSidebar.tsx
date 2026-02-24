import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Play, 
  Pause, 
  AlertTriangle, 
  Wrench,
  Activity,
  Package,
  Settings,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useMachineStore } from '@/store/machineStore';
import { STATUS_COLORS } from '@/types/machine';
import type { MachineStatus } from '@/types/machine';

const statusIcons: Record<MachineStatus, React.ReactNode> = {
  active: <Play className="w-4 h-4" />,
  idle: <Pause className="w-4 h-4" />,
  stopped: <AlertTriangle className="w-4 h-4" />,
  maintenance: <Wrench className="w-4 h-4" />
};

const statusLabels: Record<MachineStatus, string> = {
  active: 'Active',
  idle: 'Idle',
  stopped: 'Stopped',
  maintenance: 'Maintenance'
};

const machineTypeIcons: Record<string, React.ReactNode> = {
  conveyor: <ArrowRightLeft className="w-5 h-5" />,
  processor: <Settings className="w-5 h-5" />,
  packer: <Package className="w-5 h-5" />,
  quality: <Activity className="w-5 h-5" />
};

export function MachineSidebar() {
  const { 
    machines, 
    selectedMachineId, 
    selectMachine, 
    updateMachine, 
    deleteMachine,
    updateMachineStatus 
  } = useMachineStore();

  const selectedMachine = machines.find((m) => m.id === selectedMachineId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    throughput: 0,
    status: 'idle' as MachineStatus
  });

  // Update form when selection changes
  useEffect(() => {
    if (selectedMachine) {
      setFormData({
        name: selectedMachine.name,
        description: selectedMachine.description || '',
        throughput: selectedMachine.throughput,
        status: selectedMachine.status
      });
    }
  }, [selectedMachine]);

  if (!selectedMachine) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-slate-500">
        <Settings className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-center">Select a machine on the canvas to edit its properties</p>
      </div>
    );
  }

  const handleSave = () => {
    if (selectedMachineId) {
      updateMachine(selectedMachineId, {
        name: formData.name,
        description: formData.description,
        throughput: formData.throughput,
        status: formData.status
      });
    }
  };

  const handleDelete = () => {
    if (selectedMachineId) {
      deleteMachine(selectedMachineId);
      selectMachine(null);
    }
  };

  const handleStatusChange = (newStatus: MachineStatus) => {
    setFormData({ ...formData, status: newStatus });
    if (selectedMachineId) {
      updateMachineStatus(selectedMachineId, newStatus);
    }
  };

  const statusColor = STATUS_COLORS[selectedMachine.status];

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {machineTypeIcons[selectedMachine.type || 'processor']}
          <h2 className="font-semibold text-white">Machine Details</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => selectMachine(null)}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-400">Current Status</CardDescription>
            <div className="flex items-center gap-3 mt-1">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${statusColor}30`, color: statusColor }}
              >
                {statusIcons[selectedMachine.status]}
              </div>
              <div>
                <CardTitle className="text-lg text-white">
                  {statusLabels[selectedMachine.status]}
                </CardTitle>
                <p className="text-xs text-slate-400">ID: {selectedMachine.id}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Status Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(statusLabels) as MachineStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                formData.status === status
                  ? 'border-white bg-white/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-xs text-white">{statusLabels[status]}</span>
            </button>
          ))}
        </div>

        <Separator className="bg-slate-800" />

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Machine Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Enter machine name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-300">Machine Type</Label>
            <Select 
              value={selectedMachine.type || 'processor'}
              disabled
            >
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="conveyor">Conveyor</SelectItem>
                <SelectItem value="processor">Processor</SelectItem>
                <SelectItem value="packer">Packer</SelectItem>
                <SelectItem value="quality">Quality Control</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              placeholder="Enter description"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="throughput" className="text-slate-300">Throughput</Label>
              <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                {formData.throughput} units/hr
              </Badge>
            </div>
            <Slider
              id="throughput"
              value={[formData.throughput]}
              onValueChange={(value) => setFormData({ ...formData, throughput: value[0] })}
              max={200}
              min={0}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Position</Label>
            <div className="grid grid-cols-3 gap-2">
              {selectedMachine.position.map((coord, i) => (
                <div 
                  key={i} 
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center"
                >
                  <span className="text-xs text-slate-500">{['X', 'Y', 'Z'][i]}</span>
                  <p className="text-sm text-white font-mono">{coord.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Button 
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button 
          onClick={handleDelete}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Machine
        </Button>
      </div>
    </div>
  );
}

export default MachineSidebar;
