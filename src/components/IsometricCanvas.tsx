import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { Machine, Connection } from '@/types/machine';
import { STATUS_COLORS, STATUS_COLORS_EMISSIVE } from '@/types/machine';
import { useMachineStore } from '@/store/machineStore';

// ============================================
// MACHINE 3D COMPONENT
// ============================================
interface MachineMeshProps {
  machine: Machine;
  isSelected: boolean;
  onClick: () => void;
}

function MachineMesh({ machine, isSelected, onClick }: MachineMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const color = STATUS_COLORS[machine.status];
  const emissiveColor = STATUS_COLORS_EMISSIVE[machine.status];
  
  // Pulse animation for active machines
  useFrame((state) => {
    if (meshRef.current && machine.status === 'active') {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 0.9;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  // Machine type determines geometry
  const getGeometry = () => {
    switch (machine.type) {
      case 'conveyor':
        return <boxGeometry args={[1.8, 0.6, 1.2]} />;
      case 'processor':
        return <boxGeometry args={[1.6, 1.4, 1.6]} />;
      case 'packer':
        return <boxGeometry args={[1.8, 1.2, 1.4]} />;
      case 'quality':
        return <boxGeometry args={[1.4, 1.0, 1.4]} />;
      default:
        return <boxGeometry args={[1.5, 1.0, 1.5]} />;
    }
  };

  return (
    <group position={machine.position}>
      {/* Selection Highlight Ring */}
      {isSelected && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Hover Highlight Ring */}
      {hovered && !isSelected && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.3, 32]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Main Machine Body */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        castShadow
        receiveShadow
      >
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={machine.status === 'active' ? 0.3 : 0.1}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Machine Label */}
      <Html position={[0, 1.2, 0]} center distanceFactor={8}>
        <div className="pointer-events-none select-none">
          <div className="bg-slate-900/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap border border-slate-700">
            {machine.name}
          </div>
          <div 
            className="text-[10px] text-center mt-1 px-1.5 py-0.5 rounded-full inline-block"
            style={{ 
              backgroundColor: color,
              color: '#fff',
              fontWeight: 'bold'
            }}
          >
            {machine.status.toUpperCase()}
          </div>
        </div>
      </Html>

      {/* Status Indicator Light */}
      <mesh position={[0.6, 0.8, 0.6]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={machine.status === 'active' ? 1 : 0.3}
        />
      </mesh>

      {/* Throughput Badge (only show if > 0) */}
      {machine.throughput > 0 && (
        <Html position={[-0.6, 0.5, 0.6]} center distanceFactor={8}>
          <div className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {machine.throughput}/hr
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================
// CONNECTION LINE COMPONENT
// ============================================
interface ConnectionLineProps {
  connection: Connection;
  machines: Machine[];
}

function ConnectionLine({ connection, machines }: ConnectionLineProps) {
  const fromMachine = machines.find((m) => m.id === connection.fromMachineId);
  const toMachine = machines.find((m) => m.id === connection.toMachineId);

  if (!fromMachine || !toMachine) return null;

  const start = new THREE.Vector3(...fromMachine.position);
  const end = new THREE.Vector3(...toMachine.position);
  
  // Create curved path
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  midPoint.y += 0.5; // Arc height

  const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
  const points = curve.getPoints(20);

  // Create line geometry from points
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [points]);

  // Animated particle along the path
  const particleRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (particleRef.current && fromMachine.status === 'active') {
      const t = (state.clock.elapsedTime * 0.5) % 1;
      const pos = curve.getPoint(t);
      particleRef.current.position.copy(pos);
    }
  });

  return (
    <group>
      {/* Connection Line */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: '#64748b', linewidth: 2 }))} />

      {/* Animated Flow Particle */}
      {fromMachine.status === 'active' && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#22c55e" />
        </mesh>
      )}

      {/* Direction Arrow */}
      <mesh 
        position={[midPoint.x, midPoint.y - 0.2, midPoint.z]} 
        rotation={[-Math.PI / 2, 0, Math.atan2(end.z - start.z, end.x - start.x)]}
      >
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>
    </group>
  );
}

// ============================================
// FLOOR GRID COMPONENT
// ============================================
function FloorGrid() {
  return (
    <>
      {/* Main Grid */}
      <Grid
        position={[0, -0.5, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={25}
        fadeStrength={1}
        infiniteGrid
      />
      
      {/* Floor Plane for Shadows */}
      <mesh position={[0, -0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
      </mesh>
    </>
  );
}

// ============================================
// SCENE CONTROLLER
// ============================================
function SceneController() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set isometric-like view
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

// ============================================
// MAIN ISOMETRIC CANVAS COMPONENT
// ============================================
interface IsometricCanvasProps {
  className?: string;
}

export function IsometricCanvas({ className = '' }: IsometricCanvasProps) {
  const { 
    machines, 
    connections, 
    selectedMachineId, 
    selectMachine,
    loadInitialData 
  } = useMachineStore();

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleMachineClick = useCallback((machineId: string) => {
    selectMachine(machineId === selectedMachineId ? null : machineId);
  }, [selectMachine, selectedMachineId]);

  const handleBackgroundClick = useCallback(() => {
    selectMachine(null);
  }, [selectMachine]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        onClick={handleBackgroundClick}
      >
        {/* Scene Controller for initial camera position */}
        <SceneController />
        
        {/* Camera */}
        <PerspectiveCamera
          makeDefault
          position={[15, 15, 15]}
          fov={45}
          near={0.1}
          far={1000}
        />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2 - 0.1}
          target={[0, 0, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.3} color="#3b82f6" />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#f59e0b" />

        {/* Floor Grid */}
        <FloorGrid />

        {/* Connection Lines */}
        {connections.map((connection) => (
          <ConnectionLine
            key={connection.id}
            connection={connection}
            machines={machines}
          />
        ))}

        {/* Machines */}
        {machines.map((machine) => (
          <MachineMesh
            key={machine.id}
            machine={machine}
            isSelected={machine.id === selectedMachineId}
            onClick={() => handleMachineClick(machine.id)}
          />
        ))}

        {/* Coordinate Axes Helper */}
        <axesHelper args={[5]} position={[-12, 0, -12]} />
      </Canvas>

      {/* Overlay UI */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-lg border border-slate-700">
          <h3 className="font-semibold text-sm mb-2">Flow 3D - Production Line</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Active ({machines.filter(m => m.status === 'active').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Idle ({machines.filter(m => m.status === 'idle').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Stopped ({machines.filter(m => m.status === 'stopped').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Maintenance ({machines.filter(m => m.status === 'maintenance').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Hint */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-sm text-slate-300 p-2 rounded-lg border border-slate-700 text-xs">
          <p>Left Click: Select Machine | Right Click + Drag: Pan | Scroll: Zoom</p>
        </div>
      </div>

      {/* Selected Machine Info */}
      {selectedMachineId && (
        <div className="absolute top-4 right-4 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-sm text-white p-3 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400">Selected Machine</p>
            <p className="font-mono text-sm">{selectedMachineId}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default IsometricCanvas;
