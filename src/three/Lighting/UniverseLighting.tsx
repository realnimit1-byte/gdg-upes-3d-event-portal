import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const UniverseLighting: React.FC = () => {
  const { scene, gl } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.65;

    return () => {
      scene.environment = null;
      envRT.dispose();
      roomEnv.dispose();
      pmremGenerator.dispose();
    };
  }, [scene, gl]);

  return (
    <>
      <color attach="background" args={['#080B18']} />
      <fogExp2 attach="fog" args={['#080B18', 0.024]} />

      {/* Warm/cool studio rig */}
      <hemisphereLight args={['#8fb4ff', '#101222', 0.65]} />
      <directionalLight position={[8, 10, 8]} intensity={1.4} color="#fff7ed" />
      <directionalLight position={[-10, -4, -6]} intensity={0.8} color="#61D9FF" />

      {/* Google 4-color + Electric Violet spatial accents */}
      <pointLight position={[-4.5, 2.8, 3]} intensity={9} distance={18} decay={2} color="#4285F4" />
      <pointLight position={[5.2, -1.8, 2]} intensity={8} distance={16} decay={2} color="#EA4335" />
      <pointLight position={[2.5, 3.2, -9]} intensity={10} distance={20} decay={2} color="#FBBC05" />
      <pointLight position={[-4.5, -2.5, -16]} intensity={10} distance={22} decay={2} color="#34A853" />
      <pointLight position={[0, 1.5, -28]} intensity={16} distance={28} decay={2} color="#755CFF" />
      <pointLight position={[4, -2, -32]} intensity={12} distance={24} decay={2} color="#5C67F9" />
    </>
  );
};
