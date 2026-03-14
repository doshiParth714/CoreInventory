"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Grid, PerspectiveCamera, OrbitControls } from "@react-three/drei";

function MovingGrid() {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    const t = state.clock.getElapsedTime();
    gridRef.current.position.z = (t * 0.5) % 1; // Slow infinite scroll effect
  });

  return (
    <group ref={gridRef}>
      <Grid
        infiniteGrid
        sectionSize={3}
        sectionThickness={1.5}
        sectionColor="#6366f1"
        fadeDistance={30}
      />
    </group>
  );
}

function StockPillar({ position, height, color }: { position: [number, number, number], height: number, color: string }) {
  return (
    <mesh position={[position[0], height / 2, position[2]]}>
      <boxGeometry args={[0.5, height, 0.5]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.8} />
    </mesh>
  );
}

export default function WarehouseGrid() {
  const pillars = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 10,
        0,
        (Math.random() - 0.5) * 10,
      ] as [number, number, number],
      height: 1 + Math.random() * 3,
      color: i % 2 === 0 ? "#6366f1" : "#10b981",
    }));
  }, []);

  return (
    <div className="h-[200px] w-full rounded-xl overflow-hidden bg-[#0f111a] border border-white/10 relative group">
      <div className="absolute top-3 left-3 z-10">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Stock Capacity Visualization</p>
      </div>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={50} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <MovingGrid />
        {pillars.map((props, i) => (
          <StockPillar key={i} {...props} />
        ))}
      </Canvas>
    </div>
  );
}
