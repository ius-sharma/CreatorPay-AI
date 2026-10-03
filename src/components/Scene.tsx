'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SECTIONS, cameraPath, lookAtPath, coinStationPath, SectionConfig } from '@/config/sections';

interface SceneProps {
  lerpedProgress: number;
  prefersReducedMotion?: boolean;
  isMobile?: boolean;
}

// 1. Camera Rig along CatmullRomCurve3
function CameraRig({
  lerpedProgress,
  prefersReducedMotion,
  mouse,
}: {
  lerpedProgress: number;
  prefersReducedMotion?: boolean;
  mouse: { x: number; y: number };
}) {
  const currentPosRef = useRef(new THREE.Vector3());
  const currentLookAtRef = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    // If user prefers reduced motion, stay at fixed overview
    if (prefersReducedMotion) {
      camera.position.set(0, -6, 12);
      camera.lookAt(0, -6, 0);
      return;
    }

    const t = THREE.MathUtils.clamp(lerpedProgress, 0, 0.999);

    // Sample camera eye and target along the CatmullRom splines
    const targetCamPos = cameraPath.getPointAt(t);
    const targetLookAt = lookAtPath.getPointAt(t);

    // Subtle mouse parallax tilt (soft dampening)
    const parallaxX = mouse.x * 0.45;
    const parallaxY = mouse.y * 0.35;

    // Smooth lerp to camera coordinates
    currentPosRef.current.lerp(
      new THREE.Vector3(targetCamPos.x + parallaxX, targetCamPos.y + parallaxY, targetCamPos.z),
      0.08
    );
    currentLookAtRef.current.lerp(targetLookAt, 0.08);

    camera.position.copy(currentPosRef.current);
    camera.lookAt(currentLookAtRef.current);
  });

  return null;
}

// 2. Continuous 3D Guide Line (The Journey Rail)
function JourneyRail() {
  const points = useMemo(() => {
    return coinStationPath.getPoints(120);
  }, []);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <primitive object={new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: '#635bff',
        transparent: true,
        opacity: 0.25,
        linewidth: 2,
      })
    )} />
  );
}

// 3. Traveler Coin Placeholder (Stage 1 Scaffold)
function TravelerCoinPlaceholder({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const t = THREE.MathUtils.clamp(progress, 0, 0.999);
    const pos = coinStationPath.getPointAt(t);
    meshRef.current.position.copy(pos);

    // Continuous gentle rotation + scroll spin
    meshRef.current.rotation.y += delta * 1.5;
    meshRef.current.rotation.x = Math.sin(t * Math.PI * 4) * 0.2;

    if (glowRef.current) {
      glowRef.current.position.copy(pos);
    }
  });

  return (
    <>
      <pointLight ref={glowRef} color="#635bff" intensity={2.5} distance={3} />
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0.42, 0.42, 0.09, 32]} />
        <meshStandardMaterial
          color="#ffc439"
          roughness={0.2}
          metalness={0.9}
          emissive="#635bff"
          emissiveIntensity={0.15}
        />
        {/* Subtle Coin Edge Ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.42, 0.02, 16, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.95} />
        </mesh>
      </mesh>
    </>
  );
}

// 4. Milestone Station Placeholder Boxes (Stage 1 Scaffold)
function StationBox({
  section,
  index,
  active,
}: {
  section: SectionConfig;
  index: number;
  active: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * (active ? 0.4 : 0.1);
  });

  return (
    <group position={section.nodePos}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Box Mesh */}
        <mesh ref={meshRef}>
          <boxGeometry args={[1.5, 0.9, 0.15]} />
          <meshStandardMaterial
            color={active ? '#ffffff' : '#f8fafc'}
            roughness={0.25}
            metalness={0.1}
            transparent
            opacity={active ? 0.95 : 0.65}
          />
          {/* Wireframe Outline */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.5, 0.9, 0.15)]} />
            <lineBasicMaterial
              color={active ? section.accent : '#cbd5e1'}
              linewidth={1.5}
              transparent
              opacity={active ? 0.9 : 0.4}
            />
          </lineSegments>
        </mesh>

        {/* 3D Floating HTML Marker Tag */}
        <Html
          position={[0, 0.75, 0]}
          center
          distanceFactor={7}
          className="pointer-events-none select-none transition-all duration-300"
        >
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border shadow-xs transition-all duration-300 flex items-center space-x-1.5 ${
              active
                ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                : 'bg-white/90 text-slate-600 border-slate-200 backdrop-blur-xs'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: section.accent }}
            />
            <span>{section.badge}</span>
          </div>
        </Html>
      </Float>
    </group>
  );
}

// 5. Main Canvas Scene
export default function Scene({
  lerpedProgress,
  prefersReducedMotion = false,
  isMobile = false,
}: SceneProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hasWebGL, setHasWebGL] = useState(true);

  // Parallax mouse tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // WebGL Fallback Detection
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#fbfbfe] flex items-center justify-center">
        <div className="p-4 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-500">
          WebGL preview unavailable · Using static visual mode
        </div>
      </div>
    );
  }

  // Active section identification for highlight
  const activeIndex = SECTIONS.findIndex(
    (sec) => lerpedProgress >= sec.scrollRange[0] && lerpedProgress <= sec.scrollRange[1]
  );

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[#fbfbfe]">
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45, near: 0.1, far: 50 }}
        dpr={Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Studio Lighting Setup */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 7]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-6, -5, -4]} intensity={0.4} color="#635bff" />
        <pointLight position={[0, 4, 3]} intensity={0.6} color="#00b8d9" />

        {/* Camera Rig driven by Scroll */}
        <CameraRig
          lerpedProgress={lerpedProgress}
          prefersReducedMotion={prefersReducedMotion}
          mouse={mouse}
        />

        {/* 3D Journey Rail Line */}
        <JourneyRail />

        {/* Traveler Coin (The Hero Element) */}
        <TravelerCoinPlaceholder progress={lerpedProgress} />

        {/* 7 Placeholder Milestone Stations */}
        {SECTIONS.map((sec, idx) => (
          <StationBox
            key={sec.id}
            section={sec}
            index={idx}
            active={activeIndex === idx}
          />
        ))}
      </Canvas>
    </div>
  );
}
