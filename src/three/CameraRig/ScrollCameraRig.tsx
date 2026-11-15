import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface ScrollCameraRigProps {
  scrollProgressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isMobile: boolean;
}

const _lookTarget = new THREE.Vector3(0, 0, 0);

export const ScrollCameraRig: React.FC<ScrollCameraRigProps> = ({
  scrollProgressRef,
  pointerRef,
  isMobile,
}) => {
  const { camera } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 9));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = THREE.MathUtils.clamp(scrollProgressRef.current, 0, 1);

    // Smooth camera journey from Hero (z=+9) through Universe/About/Events down to Registration/Footer (z=-26)
    const targetZ = THREE.MathUtils.lerp(9.0, -26.5, p);
    const parallaxScale = isMobile ? 0.15 : 0.65;
    const targetX = pointerRef.current.x * parallaxScale + Math.sin(p * Math.PI * 2) * 0.55;
    const targetY = pointerRef.current.y * (parallaxScale * 0.6) + Math.cos(p * Math.PI * 1.5) * 0.25;

    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetX, 4.5, dt);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetY, 4.5, dt);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetZ, 4.5, dt);

    camera.position.copy(currentPos.current);

    _lookTarget.set(
      pointerRef.current.x * 0.2,
      pointerRef.current.y * 0.12,
      currentPos.current.z - 11,
    );
    camera.lookAt(_lookTarget);
  });

  return null;
};
