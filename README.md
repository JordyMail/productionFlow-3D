# Flow 3D - Production Line Dashboard

A 3D isometric dashboard for visualizing and managing production line machines in real-time. Built with React, Three.js, and Tailwind CSS.

<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/60bedc5b-594e-4e09-be2e-6ee7ed1eeff1" />


## Features

- **3D Isometric Canvas**: Interactive 3D visualization of production line layout
- **CRUD Operations**: Create, Read, Update, Delete machines
- **Connection Lines**: Visualize production flow between machines
- **Real-time Data**: Live status updates with color-coded visualization
- **Machine Types**: Support for Conveyor, Processor, Packer, and Quality Control units
- **Simulation Mode**: Built-in simulation for testing without real data

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Engine**: React Three Fiber (Three.js)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Build Tool**: Vite

## Project Structure

```
src/
├── api/
│   └── productionApi.ts       # API integration module
├── components/
│   ├── IsometricCanvas.tsx    # Main 3D canvas component
│   ├── MachineSidebar.tsx     # Machine editing sidebar
│   └── Toolbar.tsx            # Top toolbar with actions
├── data/
│   └── sampleProductionData.json  # Sample data format
├── hooks/
│   └── useSimulation.ts       # Simulation hook
├── store/
│   └── machineStore.ts        # Zustand state management
├── types/
│   └── machine.ts             # TypeScript type definitions
├── App.tsx                    # Main application
└── index.css                  # Global styles
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Machine Data Format

```typescript
interface Machine {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'stopped' | 'maintenance';
  throughput: number;        // units per hour
  position: [x, y, z];       // 3D coordinates
  type: 'conveyor' | 'processor' | 'packer' | 'quality';
  description?: string;
}
```

## Status Colors

| Status      | Color  | Description          |
|-------------|--------|---------------------|
| Active      | Green  | Machine running     |
| Idle        | Yellow | Machine on standby  |
| Stopped     | Red    | Machine stopped     |
| Maintenance | Blue   | Under maintenance   |

## API Integration

### Option 1: WebSocket (Recommended for real-time)

```typescript
import { useProductionDataRealtime } from '@/api/productionApi';

function App() {
  useProductionDataRealtime(true); // Enable WebSocket
  // ...
}
```

### Option 2: HTTP Polling

```typescript
import { useProductionDataRealtime } from '@/api/productionApi';

function App() {
  useProductionDataRealtime(false); // Use polling
  // ...
}
```

### Expected API Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "lineId": "line-001",
  "machines": [
    {
      "id": "machine-001",
      "status": "active",
      "throughput": 120,
      "efficiency": 95.5
    }
  ]
}
```

## Configuration

Set your API URL in `.env`:

```
VITE_API_URL=http://your-api-server.com/api
```

## Controls

- **Left Click**: Select machine
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out
- **Left Click + Drag**: Rotate view

## License

MIT
