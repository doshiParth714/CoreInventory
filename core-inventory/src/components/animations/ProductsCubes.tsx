"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";

function Cube({ position, color, speed }: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * speed * 0.2;
    meshRef.current.rotation.y = t * speed * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <MeshDistortMaterial color={color} speed={1.5} distort={0.2} opacity={0.7} transparent roughness={0.2} metalness={0.6} />
      </mesh>
    </Float>
  );
}

export default function ProductsCubes() {
  const cubes = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        position: [(i % 4) * 0.8 - 1.2, Math.floor(i / 4) * 0.8 - 0.4, 0] as [number, number, number],
        color: i % 2 === 0 ? "#6366f1" : "#10b981",
        speed: 0.3 + (i % 3) * 0.1,
      })),
    []
  );
  return (
    <div className="h-[120px] w-full rounded-xl overflow-hidden bg-[#0f111a] border border-white/10">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 4]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        {cubes.map((props, i) => (
          <Cube key={i} {...props} />
        ))}
      </Canvas>
    </div>
  );
}
