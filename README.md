# Flow 3D - Production Line Dashboard

A 3D isometric dashboard for visualizing and managing production line machines in real-time. Built with React, Three.js, and Tailwind CSS.

<img width="1919" height="866" alt="image" src="https://github.com/user-attachments/assets/60bedc5b-594e-4e09-be2e-6ee7ed1eeff1" />


## Structure

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

## Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
