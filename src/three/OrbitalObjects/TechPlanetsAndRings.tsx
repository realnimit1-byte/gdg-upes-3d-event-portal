import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface PlanetSpec {
  position: [number, number, number];
  radius: number;
  coreColor: string;
  ringColor: string;
  tilt: [number, number, number];
  speed: number;
}

const PLANET_SPECS: PlanetSpec[] = [
  {
    position: [-5.8, 2.2, -7.5],
    radius: 0.92,
    coreColor: '#4285F4',
    ringColor: '#61D9FF',
    tilt: [0.45, 0.2, 0.3],
    speed: 0.35,
  },
  {
    position: [5.4, -1.6, -13.5],
    radius: 1.18,
    coreColor: '#755CFF',
    ringColor: '#FBBC05',
    tilt: [-0.35, 0.4, -0.2],
    speed: 0.28,
  },
  {
    position: [-5.2, -1.9, -21.5],
    radius: 0.85,
    coreColor: '#34A853',
    ringColor: '#5C67F9',
    tilt: [0.5, -0.3, 0.25],
    speed: 0.42,
  },
  {
    position: [5.8, 2.4, -29.0],
    radius: 1.05,
    coreColor: '#EA4335',
    ringColor: '#61D9FF',
    tilt: [-0.42, 0.25, 0.38],
    speed: 0.3,
  },
];

const CompositeTechPlanet: React.FC<{ spec: PlanetSpec; index: number }> = ({ spec, index }) => {
  const groupRef = useRef<THREE.Group>(null);
  const satRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * spec.speed * 0.45;
      groupRef.current.position.y = spec.position[1] + Math.sin(t * 0.9 + index * 1.4) * 0.22;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * spec.speed;
    }
    if (satRef.current) {
      const orbitR = spec.radius * 1.75;
      satRef.current.position.x = Math.cos(t * spec.speed * 1.8 + index) * orbitR;
      satRef.current.position.z = Math.sin(t * spec.speed * 1.8 + index) * orbitR;
    }
  });

  return (
    <group ref={groupRef} position={spec.position} rotation={spec.tilt}>
      {/* Faceted metallic/glass core */}
      <mesh>
        <icosahedronGeometry args={[spec.radius, 1]} />
        <meshStandardMaterial
          color="#181c30"
          metalness={0.78}
          roughness={0.28}
          emissive={spec.coreColor}
          emissiveIntensity={0.28}
        />
      </mesh>

      {/* Outer geodesic wireframe lattice */}
      <mesh>
        <icosahedronGeometry args={[spec.radius * 1.08, 1]} />
        <meshBasicMaterial color={spec.coreColor} wireframe transparent opacity={0.48} />
      </mesh>

      {/* Tilted orbital ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.2, 0.15, 0]}>
        <torusGeometry args={[spec.radius * 1.75, 0.02, 10, 64]} />
        <meshStandardMaterial
          color={spec.ringColor}
          emissive={spec.ringColor}
          emissiveIntensity={0.75}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* Orbiting satellite node */}
      <mesh ref={satRef} position={[spec.radius * 1.75, 0, 0]}>
        <octahedronGeometry args={[spec.radius * 0.16, 0]} />
        <meshStandardMaterial
          color={spec.ringColor}
          emissive={spec.ringColor}
          emissiveIntensity={1.4}
        />
      </mesh>
    </group>
  );
};

export const TechPlanetsAndRings: React.FC = () => {
  const planets = useMemo(() => PLANET_SPECS, []);
  return (
    <group>
      {planets.map((spec, idx) => (
        <CompositeTechPlanet key={idx} spec={spec} index={idx} />
      ))}
    </group>
  );
};
