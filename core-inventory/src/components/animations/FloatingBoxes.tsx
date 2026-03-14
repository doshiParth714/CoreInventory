"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PerspectiveCamera } from "@react-three/drei";

function Drone({ position, speed, delay, direction }: { position: [number, number, number], speed: number, delay: number, direction: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const propRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current || !propRef.current) return;
    const t = state.clock.getElapsedTime();
    if (t > delay) {
      groupRef.current.position.x += speed * direction; 
      groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.3; // Bobbing
      groupRef.current.rotation.z = Math.sin(t * 3) * 0.1 * direction; // Tilting
      
      if (direction > 0 && groupRef.current.position.x > 15) groupRef.current.position.x = -15;
      if (direction < 0 && groupRef.current.position.x < -15) groupRef.current.position.x = 15;
    }
    propRef.current.rotation.y += 0.4;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Drone Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Propellers */}
      <group ref={propRef}>
        <mesh position={[0.5, 0.1, 0]}>
          <boxGeometry args={[0.05, 0.02, 0.6]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[-0.5, 0.1, 0]}>
          <boxGeometry args={[0.05, 0.02, 0.6]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
         <mesh position={[0, 0.1, 0.5]}>
          <boxGeometry args={[0.6, 0.02, 0.05]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh position={[0, 0.1, -0.5]}>
          <boxGeometry args={[0.6, 0.02, 0.05]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>
      
      {/* Payload (DMart Box) */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#2dd4bf" roughness={0.2} metalness={0.8} transparent opacity={0.9} /> 
      </mesh>
    </group>
  );
}

function ConveyorBox({ position, speed, color, delay, laneIdx }: { position: [number, number, number], speed: number, color: string, delay: number, laneIdx: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    if (t > delay) {
      meshRef.current.position.x += speed;
      meshRef.current.position.y = position[1] + Math.sin(t * 2 + laneIdx) * 0.05; // slight bumping on conveyor
      if (meshRef.current.position.x > 15) {
        meshRef.current.position.x = -15; 
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[1.2, 1, 1.2]} />
      <meshStandardMaterial color={color} roughness={0.1} metalness={0.8} transparent opacity={0.8} />
    </mesh>
  );
}

export default function FloatingBoxes({ bgTransparent = false }: { bgTransparent?: boolean }) {
  const items = useMemo(() => {
    // 3 lanes of conveyor boxes
    const boxes = Array.from({ length: 18 }).map((_, i) => {
      const lane = i % 3;
      const zPos = -2 - lane * 2;
      return {
        type: 'box',
        position: [-15 + (i * 1.5) % 15, -3, zPos] as [number, number, number],
        color: lane === 0 ? "#6366f1" : lane === 1 ? "#3b82f6" : "#0284c7", // Various shades of blue/indigo
        speed: 0.03 + lane * 0.01 + Math.random() * 0.02,
        delay: Math.random(),
        laneIdx: lane,
      };
    });

    // 6 Drones flying overhead back and forth
    const drones = Array.from({ length: 8 }).map((_, i) => {
      const direction = i % 2 === 0 ? 1 : -1;
      return {
        type: 'drone',
        position: [(Math.random() - 0.5) * 20, 1 + Math.random() * 3, -1 - Math.random() * 6] as [number, number, number],
        speed: 0.02 + Math.random() * 0.04,
        delay: Math.random() * 2,
        direction,
      };
    });

    return [...boxes, ...drones];
  }, []);

  return (
    <div className={`absolute inset-0 -z-10 ${bgTransparent ? "" : "bg-[#06080c]"}`}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 2, 8]} rotation={[-0.1, 0, 0]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#e2e8f0" castShadow />
        <directionalLight position={[-10, -5, -10]} intensity={0.5} color="#3b82f6" />
        
        {/* Floor/Conveyor Plane */}
        <mesh position={[0, -3.5, -4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 15]} />
          <meshStandardMaterial color="#0f111a" opacity={0.6} transparent />
        </mesh>

        {items.map((props, i) => (
          props.type === 'box' 
            ? <ConveyorBox key={i} {...(props as any)} /> 
            : <Drone key={i} {...(props as any)} />
        ))}
        
        <fog attach="fog" args={["#06080c", 5, 20]} />
      </Canvas>
    </div>
  );
}
