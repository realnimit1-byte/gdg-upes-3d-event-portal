import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { createCodeFragmentTexture } from '../utils/webglUtils';

interface AmbientStarfieldProps {
  isMobile: boolean;
  isSoftwareGl: boolean;
  successBurstActive: boolean;
}

const CODE_CARDS = [
  { lines: ['const chapter = "GDG UPES";', 'await chapter.buildUniverse();'], accent: '#4285F4', pos: [-4.6, -1.3, -4.2] as [number, number, number] },
  { lines: ['gcloud ai models deploy', '--region=asia-south1'], accent: '#34A853', pos: [4.8, 1.8, -10.8] as [number, number, number] },
  { lines: ['<GDGOnCampus', '  city="Dehradun" />'], accent: '#FBBC05', pos: [-4.9, 1.6, -18.2] as [number, number, number] },
  { lines: ['kubectl apply -f cluster.yaml', '// scalable cloud native'], accent: '#755CFF', pos: [4.6, -1.8, -25.4] as [number, number, number] },
];

export const AmbientStarfield: React.FC<AmbientStarfieldProps> = ({
  isMobile,
  isSoftwareGl,
  successBurstActive,
}) => {
  const starRef = useRef<THREE.Points>(null);
  const burstRingRef = useRef<THREE.Mesh>(null);
  const fragGroupRef = useRef<THREE.Group>(null);

  const count = isMobile || isSoftwareGl ? 320 : 720;

  const starGeo = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#61D9FF'),
      new THREE.Color('#755CFF'),
      new THREE.Color('#4285F4'),
      new THREE.Color('#E2E8F0'),
      new THREE.Color('#FBBC05'),
    ];

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const seed3 = Math.sin(i * 45.164) * 43758.5453;
      const r1 = seed1 - Math.floor(seed1);
      const r2 = seed2 - Math.floor(seed2);
      const r3 = seed3 - Math.floor(seed3);

      positions[i3] = (r1 - 0.5) * 32;
      positions[i3 + 1] = (r2 - 0.5) * 20;
      positions[i3 + 2] = 8 - r3 * 52;

      const c = palette[i % palette.length];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [count]);

  const cardTextures = useMemo(() => {
    return CODE_CARDS.map((card) => createCodeFragmentTexture(card.lines, card.accent));
  }, []);

  useEffect(() => {
    return () => {
      starGeo.dispose();
      cardTextures.forEach((t) => t.dispose());
    };
  }, [starGeo, cardTextures]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    if (starRef.current) {
      starRef.current.rotation.z += dt * (successBurstActive ? 0.09 : 0.02);
    }

    if (fragGroupRef.current) {
      fragGroupRef.current.children.forEach((child, idx) => {
        child.position.y = CODE_CARDS[idx].pos[1] + Math.sin(t * 0.8 + idx * 1.5) * 0.22;
        child.rotation.y = Math.sin(t * 0.35 + idx) * 0.18;
      });
    }

    if (burstRingRef.current) {
      const targetScale = successBurstActive ? 1.35 : 0.001;
      const s = THREE.MathUtils.damp(burstRingRef.current.scale.x, targetScale, 4, dt);
      burstRingRef.current.scale.setScalar(s);
      burstRingRef.current.rotation.z += dt * 0.8;
    }
  });

  return (
    <group>
      <points ref={starRef} geometry={starGeo}>
        <pointsMaterial
          size={isMobile ? 0.08 : 0.065}
          vertexColors
          transparent
          opacity={0.78}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Floating holographic developer code fragments */}
      {!isMobile && (
        <group ref={fragGroupRef}>
          {CODE_CARDS.map((card, idx) => (
            <mesh key={idx} position={card.pos}>
              <planeGeometry args={[2.3, 0.86]} />
              <meshBasicMaterial
                map={cardTextures[idx]}
                transparent
                opacity={0.78}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Confirmation luminous convergence ring in Registration zone */}
      <mesh ref={burstRingRef} position={[0, 0, -29]} scale={0.001}>
        <torusGeometry args={[3.4, 0.04, 16, 96]} />
        <meshStandardMaterial
          color="#61D9FF"
          emissive="#755CFF"
          emissiveIntensity={2.2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
};
