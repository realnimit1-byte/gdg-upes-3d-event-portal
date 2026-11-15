import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ConstellationNetworkProps {
  isMobile: boolean;
}

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const ConstellationNetwork: React.FC<ConstellationNetworkProps> = ({ isMobile }) => {
  const groupRef = useRef<THREE.Group>(null);
  const instancedRef = useRef<THREE.InstancedMesh>(null);

  const nodeCount = isMobile ? 42 : 76;

  const { nodes, lineGeo, colors } = useMemo(() => {
    const rand = seededRandom(20261115);
    const pts: THREE.Vector3[] = [];
    const palette = ['#4285F4', '#755CFF', '#61D9FF', '#34A853', '#5C67F9'];
    const nodeColors: THREE.Color[] = [];

    for (let i = 0; i < nodeCount; i += 1) {
      const spreadX = 16;
      const spreadY = 10;
      const z = 4 - (i / nodeCount) * 44; // Spans Hero (z=+4) through Registration/Footer (z=-40)
      const x = (rand() - 0.5) * spreadX;
      const y = (rand() - 0.5) * spreadY;
      pts.push(new THREE.Vector3(x, y, z));
      nodeColors.push(new THREE.Color(palette[i % palette.length]));
    }

    const segments: number[] = [];
    const segColors: number[] = [];
    const maxDist = 5.6;

    for (let i = 0; i < pts.length; i += 1) {
      for (let j = i + 1; j < pts.length; j += 1) {
        const dist = pts[i].distanceTo(pts[j]);
        if (dist < maxDist) {
          segments.push(pts[i].x, pts[i].y, pts[i].z);
          segments.push(pts[j].x, pts[j].y, pts[j].z);
          const cA = nodeColors[i];
          const cB = nodeColors[j];
          segColors.push(cA.r, cA.g, cA.b, cB.r, cB.g, cB.b);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(segColors, 3));
    geometry.computeBoundingSphere();

    return { nodes: pts, lineGeo: geometry, colors: nodeColors };
  }, [nodeCount]);

  useEffect(() => {
    if (!instancedRef.current) return;
    const dummy = new THREE.Object3D();
    nodes.forEach((pt, idx) => {
      dummy.position.copy(pt);
      const scale = 0.055 + (idx % 4) * 0.015;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instancedRef.current!.setMatrixAt(idx, dummy.matrix);
      instancedRef.current!.setColorAt(idx, colors[idx]);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
    if (instancedRef.current.instanceColor) {
      instancedRef.current.instanceColor.needsUpdate = true;
    }
    instancedRef.current.computeBoundingSphere();
  }, [nodes, colors]);

  useEffect(() => {
    return () => {
      lineGeo.dispose();
    };
  }, [lineGeo]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.08) * 0.035;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={instancedRef} args={[undefined, undefined, nodes.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
};
