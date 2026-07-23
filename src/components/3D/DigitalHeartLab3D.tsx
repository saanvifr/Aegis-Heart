import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';

export type LabMode = 'normal' | 'wireframe' | 'thermal' | 'plaque' | 'pulseWave';

interface DigitalHeartLab3DProps {
  mode: LabMode;
  showArteries?: boolean;
  bpm?: number;
}

const LabHeartMesh: React.FC<{ mode: LabMode; showArteries: boolean; bpm: number }> = ({
  mode,
  showArteries,
  bpm,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const pulseRingRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.4;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.12;
    }

    const bps = bpm / 60;
    const pulse = Math.sin(t * Math.PI * 2 * bps);
    const pulseFactor = 1 + (pulse > 0 ? Math.pow(pulse, 3) * 0.08 : 0);

    if (coreRef.current) {
      coreRef.current.scale.set(pulseFactor, pulseFactor * 1.05, pulseFactor);
    }

    if (pulseRingRef.current && mode === 'pulseWave') {
      const ringScale = 1 + ((t * 2) % 2);
      pulseRingRef.current.scale.set(ringScale, ringScale, ringScale);
    }
  });

  const getCoreColor = () => {
    if (mode === 'thermal') return 'var(--danger-rose)';
    if (mode === 'plaque') return 'var(--warning-amber)';
    if (mode === 'wireframe') return 'var(--purple-glow)';
    return 'var(--accent-cyan)';
  };

  const getEmissiveColor = () => {
    if (mode === 'thermal') return 'var(--warning-amber)';
    if (mode === 'plaque') return '#FF3D71';
    return 'var(--green-healthy)';
  };

  return (
    <group ref={groupRef}>
      {/* Core Sphere Mesh */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshPhysicalMaterial
          color={getCoreColor()}
          emissive={getEmissiveColor()}
          emissiveIntensity={mode === 'thermal' ? 1.2 : 0.6}
          roughness={mode === 'wireframe' ? 0.8 : 0.1}
          transmission={mode === 'wireframe' ? 0.9 : 0.5}
          wireframe={mode === 'wireframe'}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Coronary Arteries & Plaque Markers */}
      {showArteries && (
        <group>
          <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.5, 0.14, 16, 32, Math.PI]} />
            <meshStandardMaterial color={mode === 'plaque' ? 'var(--danger-rose)' : 'var(--accent-cyan)'} emissive={getEmissiveColor()} />
          </mesh>
          {/* Plaque Blockage Highlight Nodes */}
          {mode === 'plaque' && (
            <mesh position={[0.4, 0.2, 1.2]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color="var(--danger-rose)" />
            </mesh>
          )}
        </group>
      )}

      {/* Pulse Wave Expanding Shockwave Rings */}
      {mode === 'pulseWave' && (
        <group ref={pulseRingRef}>
          <Ring args={[1.6, 1.65, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial color="var(--accent-cyan)" side={THREE.DoubleSide} transparent opacity={0.5} />
          </Ring>
        </group>
      )}
    </group>
  );
};

export const DigitalHeartLab3D: React.FC<DigitalHeartLab3DProps> = ({
  mode = 'normal',
  showArteries = true,
  bpm = 72,
}) => {
  return (
    <div className="w-full h-full min-h-[440px] relative flex items-center justify-center overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="var(--accent-cyan)" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="var(--danger-rose)" />
        <directionalLight position={[0, 5, 5]} intensity={1.0} />

        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
          <LabHeartMesh mode={mode} showArteries={showArteries} bpm={bpm} />
        </Float>

        <OrbitControls enableZoom={true} minDistance={4} maxDistance={9} />
      </Canvas>

      {/* HUD Laboratory Overlay */}
      <div className="absolute top-4 left-4 font-mono-num text-xs text-[color:var(--text-muted)] glass-panel px-3 py-1.5 rounded-full border border-[color:var(--glass-border)]">
        MODE: <strong className="text-[var(--accent-cyan)] uppercase">{mode}</strong>
      </div>
    </div>
  );
};
