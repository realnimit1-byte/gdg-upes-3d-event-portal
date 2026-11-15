import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { UniverseLighting } from '../Lighting/UniverseLighting';
import { FloatingLogoStage } from '../LogoDisplay/FloatingLogoStage';
import { TechPlanetsAndRings } from '../OrbitalObjects/TechPlanetsAndRings';
import { ConstellationNetwork } from '../NetworkNodes/ConstellationNetwork';
import { AmbientStarfield } from '../Particles/AmbientStarfield';
import { ScrollCameraRig } from '../CameraRig/ScrollCameraRig';
import { detectSoftwareWebGL, isWebGLAvailable } from '../utils/webglUtils';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

interface DeveloperUniverseCanvasProps {
  scrollProgressRef: React.MutableRefObject<number>;
  successBurstActive?: boolean;
  showHeroLogo?: boolean;
}

const StaticUniverseFallback: React.FC = () => (
  <div
    className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#080B18]"
    aria-hidden="true"
  >
    <div
      className="absolute inset-0 opacity-70"
      style={{
        background:
          'radial-gradient(circle at 72% 28%, rgba(66, 133, 244, 0.16), transparent 42%), radial-gradient(circle at 20% 70%, rgba(117, 92, 255, 0.16), transparent 48%), radial-gradient(circle at 50% 50%, rgba(17, 18, 29, 0.9), #080B18 100%)',
      }}
    />
    <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gdg-constellation-grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="18" cy="24" r="1.5" fill="#61D9FF" />
          <circle cx="92" cy="48" r="1.5" fill="#755CFF" />
          <circle cx="54" cy="98" r="1.5" fill="#4285F4" />
          <line x1="18" y1="24" x2="92" y2="48" stroke="#5C67F9" strokeOpacity="0.35" strokeWidth="0.8" />
          <line x1="92" y1="48" x2="54" y2="98" stroke="#61D9FF" strokeOpacity="0.28" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gdg-constellation-grid)" />
    </svg>
  </div>
);

export const DeveloperUniverseCanvas: React.FC<DeveloperUniverseCanvasProps> = ({
  scrollProgressRef,
  successBurstActive = false,
  showHeroLogo = true,
}) => {
  const reducedMotion = useReducedMotion();
  const { isMobile } = useDeviceCapabilities();
  const pointerRef = useRef({ x: 0, y: 0 });
  const [contextLost, setContextLost] = useState(false);

  const webglSupported = useMemo(() => isWebGLAvailable(), []);
  const isSoftwareGl = useMemo(() => detectSoftwareWebGL(), []);

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reducedMotion, isMobile]);

  if (reducedMotion || !webglSupported || contextLost) {
    return <StaticUniverseFallback />;
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        dpr={isSoftwareGl ? 1 : isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 9], fov: 50, near: 0.1, far: 120 }}
        gl={{
          antialias: !isSoftwareGl,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          const dom = gl.domElement;
          const onLost = (event: Event) => {
            event.preventDefault();
            setContextLost(true);
          };
          const onRestored = () => {
            setContextLost(false);
          };
          dom.addEventListener('webglcontextlost', onLost, false);
          dom.addEventListener('webglcontextrestored', onRestored, false);
        }}
      >
        <UniverseLighting />
        <ScrollCameraRig
          scrollProgressRef={scrollProgressRef}
          pointerRef={pointerRef}
          isMobile={isMobile}
        />
        {showHeroLogo && (
          <FloatingLogoStage
            scrollProgressRef={scrollProgressRef}
            pointerRef={pointerRef}
            isSoftwareGl={isSoftwareGl}
            isMobile={isMobile}
          />
        )}
        <TechPlanetsAndRings />
        <ConstellationNetwork isMobile={isMobile} />
        <AmbientStarfield
          isMobile={isMobile}
          isSoftwareGl={isSoftwareGl}
          successBurstActive={successBurstActive}
        />
      </Canvas>
    </div>
  );
};
