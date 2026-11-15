import { useEffect, useState } from 'react';

export interface DeviceCapabilities {
  isMobile: boolean;
  isTouch: boolean;
}

export function useDeviceCapabilities(): DeviceCapabilities {
  const [caps, setCaps] = useState<DeviceCapabilities>(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTouch: false };
    }
    return {
      isMobile: window.innerWidth < 768,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    };
  });

  useEffect(() => {
    const update = () => {
      setCaps({
        isMobile: window.innerWidth < 768,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      });
    };
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, []);

  return caps;
}
