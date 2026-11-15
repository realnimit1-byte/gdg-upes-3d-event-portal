import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface FloatingLogoStageProps {
  scrollProgressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isSoftwareGl: boolean;
  isMobile: boolean;
}

export const FloatingLogoStage: React.FC<FloatingLogoStageProps> = ({
  scrollProgressRef,
  pointerRef,
  isSoftwareGl,
  isMobile,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();
  const [logoTexture, setLogoTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!active) return;
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 520;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Subtle dark reflective backdrop inside the glass bezel
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, 'rgba(17, 19, 32, 0.88)');
        bgGrad.addColorStop(1, 'rgba(26, 29, 46, 0.92)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw unaltered official GDG logo SVG centered with exact aspect ratio (3003x300 = 10.01:1)
        const targetW = 1360;
        const targetH = targetW * (300 / 3003);
        const offsetX = (canvas.width - targetW) / 2;
        const offsetY = 126;
        ctx.drawImage(img, offsetX, offsetY, targetW, targetH);

        // Clean campus attribution strip below the unaltered logo
        ctx.fillStyle = '#94A3B8';
        ctx.font = '600 28px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ON CAMPUS  ·  UPES DEHRADUN', canvas.width / 2, 376);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      tex.needsUpdate = true;
      setLogoTexture(tex);
    };
    img.src = '/assets/branding/gdg-logo-dark.svg';

    return () => {
      active = false;
    };
  }, [gl]);

  useEffect(() => {
    return () => {
      logoTexture?.dispose();
    };
  }, [logoTexture]);

  const panelGeo = useMemo(() => new THREE.BoxGeometry(5.2, 1.85, 0.14), []);
  const faceGeo = useMemo(() => new THREE.PlaneGeometry(4.95, 1.62), []);
  const bracketGeo = useMemo(() => new THREE.BoxGeometry(0.42, 0.08, 0.2), []);
  const accentBarGeo = useMemo(() => new THREE.BoxGeometry(1.1, 0.035, 0.16), []);

  useEffect(() => {
    return () => {
      panelGeo.dispose();
      faceGeo.dispose();
      bracketGeo.dispose();
      accentBarGeo.dispose();
    };
  }, [panelGeo, faceGeo, bracketGeo, accentBarGeo]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const scroll = scrollProgressRef.current;

    if (groupRef.current) {
      // Hero resting position shifts gracefully toward upper-right on desktop, centered on mobile
      const baseX = isMobile ? 0 : 2.15;
      const baseY = isMobile ? 1.55 : 0.35;

      // As user scrolls past Hero, logo smoothly recedes into depth and drifts slightly upward
      const scrollOut = THREE.MathUtils.clamp(scroll * 3.2, 0, 1);
      const targetX = THREE.MathUtils.lerp(baseX, -1.6, scrollOut) + pointerRef.current.x * 0.28;
      const targetY =
        THREE.MathUtils.lerp(baseY, 1.9, scrollOut) +
        Math.sin(t * 1.15) * 0.12 +
        pointerRef.current.y * 0.18;
      const targetZ = THREE.MathUtils.lerp(1.4, -7.5, scrollOut);
      const targetScale = THREE.MathUtils.lerp(isMobile ? 0.62 : 0.92, 0.56, scrollOut);

      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, targetX, 5, dt);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY, 5, dt);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, targetZ, 5, dt);
      groupRef.current.scale.setScalar(
        THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5, dt),
      );

      // Clamped interactive mouse tilt so logo stays completely legible
      const targetRotY = THREE.MathUtils.clamp(
        pointerRef.current.x * 0.18 + Math.sin(t * 0.55) * 0.06,
        -0.22,
        0.22,
      );
      const targetRotX = THREE.MathUtils.clamp(
        -pointerRef.current.y * 0.12 + Math.cos(t * 0.45) * 0.03,
        -0.16,
        0.16,
      );
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotY, 6, dt);
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotX, 6, dt);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += dt * 0.22;
      outerRingRef.current.rotation.x = Math.PI * 0.38 + Math.sin(t * 0.4) * 0.06;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= dt * 0.34;
      innerRingRef.current.rotation.y = Math.cos(t * 0.35) * 0.14;
    }
  });

  const googleColors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

  return (
    <group ref={groupRef} position={[isMobile ? 0 : 2.15, isMobile ? 1.55 : 0.35, 1.4]}>
      {/* Main optical glass slab */}
      <mesh geometry={panelGeo}>
        <meshPhysicalMaterial
          color="#131728"
          metalness={0.18}
          roughness={0.14}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={isSoftwareGl ? 0.85 : 0.72}
        />
      </mesh>

      {/* Authentic unaltered GDG logo display face */}
      {logoTexture && (
        <mesh geometry={faceGeo} position={[0, 0, 0.075]}>
          <meshBasicMaterial map={logoTexture} transparent toneMapped={false} />
        </mesh>
      )}

      {/* Brushed titanium corner brackets (4 corners) */}
      {[
        [-2.42, 0.92],
        [2.42, 0.92],
        [-2.42, -0.92],
        [2.42, -0.92],
      ].map(([x, y], idx) => (
        <mesh key={idx} geometry={bracketGeo} position={[x, y, 0]}>
          <meshStandardMaterial color="#8b96b8" metalness={0.9} roughness={0.22} />
        </mesh>
      ))}

      {/* Subtle Google 4-color illuminated edge trim bars along bottom */}
      {googleColors.map((hex, idx) => (
        <mesh
          key={hex}
          geometry={accentBarGeo}
          position={[-1.72 + idx * 1.15, -0.95, 0.02]}
        >
          <meshStandardMaterial
            color={hex}
            emissive={hex}
            emissiveIntensity={1.2}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Orbiting geometric rings framing the logo */}
      <mesh ref={outerRingRef} rotation={[Math.PI * 0.38, 0.2, 0]}>
        <torusGeometry args={[3.35, 0.018, 12, 96]} />
        <meshStandardMaterial
          color="#5C67F9"
          emissive="#5C67F9"
          emissiveIntensity={0.8}
          metalness={0.75}
          roughness={0.25}
        />
      </mesh>

      <mesh ref={innerRingRef} rotation={[-Math.PI * 0.32, -0.25, 0]}>
        <torusGeometry args={[2.9, 0.012, 10, 84]} />
        <meshStandardMaterial
          color="#61D9FF"
          emissive="#61D9FF"
          emissiveIntensity={0.7}
          metalness={0.75}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
};
