import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Torus, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface HolographicChamberProps {
  riskState?: 'healthy' | 'warning' | 'critical';
  riskScore?: number;
  interactive?: boolean;
}

// ─── Parametric Heart Geometry ───────────────────────────────────────────────
// Uses the well-known heart parametric equations:
//   x = 16·sin³(t)
//   y = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
// This produces a mathematically correct, perfectly symmetric heart.
function buildHeartGeometry() {
  const shape = new THREE.Shape();
  const N = 256;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    if (i === 0) shape.moveTo(x * 0.065, y * 0.065);
    else shape.lineTo(x * 0.065, y * 0.065);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelSegments: 20,
    steps: 1,
    bevelSize: 0.12,
    bevelThickness: 0.12,
  });
  geometry.center();
  return geometry;
}

// ─── ECG Particle Wave ────────────────────────────────────────────────────────
const ECGWave: React.FC<{ color: string }> = ({ color }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const COUNT = 120;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const x = (i / COUNT) * 8 - 4;
      const phase = x * 2.5 - t * 3;
      // ECG shape: sharp spike + gentle waves
      let y = Math.sin(phase) * 0.08;
      const spike = ((phase % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      if (spike > 5.5 && spike < 6.28) {
        const s = (spike - 5.5) / 0.78;
        y += Math.sin(s * Math.PI) * 0.7;
      }
      pos[i * 3] = x;
      pos[i * 3 + 1] = y - 2.8;
      pos[i * 3 + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color={color} size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
};

// ─── Heart Mesh ───────────────────────────────────────────────────────────────
const HeartMesh: React.FC<{ riskState: 'healthy' | 'warning' | 'critical' }> = ({ riskState }) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const { primaryColor, glowColor, bpm } = useMemo(() => {
    switch (riskState) {
      case 'critical': return { primaryColor: '#F43F5E', glowColor: '#FDA4AF', bpm: 110 };
      case 'warning':  return { primaryColor: '#FBBF24', glowColor: '#FDE68A', bpm: 85  };
      default:         return { primaryColor: '#E879A0', glowColor: '#FB923C', bpm: 60  };
    }
  }, [riskState]);

  const heartGeometry = useMemo(() => buildHeartGeometry(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Slow elegant rotation
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.35;
      groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.1;
    }

    // Realistic lub-dub heartbeat
    const bps = bpm / 60;
    const beat = (t * bps) % 1.0;
    let pulse = 1.0;
    if (beat < 0.12) {
      pulse = 1 + Math.sin((beat / 0.12) * Math.PI) * 0.22; // Lub — sharp
    } else if (beat > 0.22 && beat < 0.40) {
      pulse = 1 + Math.sin(((beat - 0.22) / 0.18) * Math.PI) * 0.13; // Dub — softer
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(pulse);
    }
    // Glow shell breathes inversely for depth
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * 1.08);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + (pulse - 1) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Solid Crystal Heart */}
      <mesh ref={coreRef} geometry={heartGeometry}>
        <meshPhysicalMaterial
          color={primaryColor}
          emissive={glowColor}
          emissiveIntensity={0.55}
          roughness={0.05}
          metalness={0.15}
          transmission={0.82}
          thickness={1.6}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent
          opacity={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing Outer Shell — pulses with beat */}
      <mesh ref={glowRef} geometry={heartGeometry} scale={1.08}>
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe Ghost */}
      <mesh geometry={heartGeometry} scale={1.18}>
        <meshBasicMaterial
          color={glowColor}
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* ECG Wave beneath the heart */}
      <ECGWave color={glowColor} />
    </group>
  );
};

// ─── HUD Rings ────────────────────────────────────────────────────────────────
const HolographicHUD: React.FC<{ riskState: 'healthy' | 'warning' | 'critical' }> = ({ riskState }) => {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Group>(null);

  const hudColor = riskState === 'critical' ? '#F43F5E' : riskState === 'warning' ? '#FBBF24' : '#E879A0';
  const nodeColor = riskState === 'critical' ? '#FDA4AF' : riskState === 'warning' ? '#FDE68A' : '#FB923C';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 0.2;
      ring1Ref.current.rotation.x = Math.sin(t * 0.08) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.28;
      ring2Ref.current.rotation.y = Math.cos(t * 0.12) * 0.15;
    }
    if (nodesRef.current) {
      nodesRef.current.rotation.y = t * 0.12;
    }
  });

  return (
    <group>
      <group ref={ring1Ref}>
        <Ring args={[2.3, 2.34, 64]} rotation={[Math.PI / 3, 0, 0]}>
          <meshBasicMaterial color={hudColor} side={THREE.DoubleSide} transparent opacity={0.35} />
        </Ring>
      </group>

      <group ref={ring2Ref}>
        <Torus args={[2.7, 0.012, 16, 128]} rotation={[-Math.PI / 4.5, 0, 0]}>
          <meshBasicMaterial color={nodeColor} transparent opacity={0.25} />
        </Torus>
      </group>

      {/* Orbiting data nodes */}
      <group ref={nodesRef}>
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 3.2, Math.sin(angle) * 0.7, Math.sin(angle) * 3.2]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshBasicMaterial color={nodeColor} />
          </mesh>
        ))}
      </group>

      {/* Ground grid */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 3.8, 48]} />
        <meshBasicMaterial color={hudColor} wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export const HolographicChamber: React.FC<HolographicChamberProps> = ({
  riskState = 'healthy',
  riskScore = 18.5,
  interactive = true,
}) => {
  const bpm = riskState === 'critical' ? 110 : riskState === 'warning' ? 85 : 60;
  const primaryHex = riskState === 'critical' ? '#F43F5E' : riskState === 'warning' ? '#FBBF24' : '#E879A0';
  const glowHex    = riskState === 'critical' ? '#FDA4AF' : riskState === 'warning' ? '#FDE68A' : '#FB923C';

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden">
      {/* Ambient background radial glow */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-700 blur-3xl opacity-20 ${
        riskState === 'critical'
          ? 'bg-gradient-to-tr from-[#F43F5E]/50 via-transparent to-[#FDA4AF]/30'
          : riskState === 'warning'
          ? 'bg-gradient-to-tr from-[#FBBF24]/40 via-transparent to-[#FDE68A]/25'
          : 'bg-gradient-to-tr from-[#E879A0]/40 via-transparent to-[#FB923C]/30'
      }`} />

      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} className="w-full h-full cursor-grab active:cursor-grabbing">
        <ambientLight intensity={0.5} />
        {/* Use hardcoded hex — CSS vars don't work in Three.js */}
        <pointLight position={[8, 8, 8]}   intensity={2.0} color={primaryHex} />
        <pointLight position={[-8, -5, -5]} intensity={1.2} color={glowHex} />
        <directionalLight position={[0, 6, 4]} intensity={0.8} color="#ffffff" />

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
          <HeartMesh riskState={riskState} />
          <HolographicHUD riskState={riskState} />
        </Float>

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={(3 * Math.PI) / 4}
          />
        )}
      </Canvas>

      {/* Bottom HUD bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none px-5 py-2.5 rounded-full glass-panel border border-[color:var(--glass-border)] text-xs font-mono-num">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-ping ${
            riskState === 'critical' ? 'bg-[var(--danger-rose)]' :
            riskState === 'warning'  ? 'bg-[var(--warning-amber)]' :
                                       'bg-[var(--green-healthy)]'
          }`} />
          <span className="text-[color:var(--text-muted)] uppercase tracking-widest">Digital Twin</span>
        </div>

        {/* Animated BPM Badge */}
        <div className="flex items-center gap-2">
          <span
            className="text-[color:var(--accent-cyan)] font-bold tabular-nums"
            style={{ animation: `bpmPulse ${60 / bpm}s ease-in-out infinite` }}
          >
            ♥ {bpm} BPM
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
            riskState === 'critical' ? 'bg-[var(--danger-rose)]/20 text-[var(--danger-rose)]' :
            riskState === 'warning'  ? 'bg-[var(--warning-amber)]/20 text-[var(--warning-amber)]' :
                                       'bg-[var(--green-healthy)]/20 text-[var(--green-healthy)]'
          }`}>
            {riskState === 'critical' ? 'CRITICAL' : riskState === 'warning' ? 'WARNING' : 'HEALTHY'}
          </span>
        </div>
      </div>
    </div>
  );
};
