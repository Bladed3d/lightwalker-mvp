import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  screenWidth: number;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTouch: false,
    screenWidth: 1024
  });

  useEffect(() => {
    const checkDeviceType = () => {
      try {
        // Check screen width
        const screenWidth = window.innerWidth;
        const isMobileWidth = window.matchMedia('(max-width: 768px)').matches;
        
        // Check touch capability
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Combine checks for mobile detection
        const isMobile = isMobileWidth || isTouch;
        
        setDeviceInfo({
          isMobile,
          isTouch,
          screenWidth
        });
      } catch (error) {
        console.error('Device detection error:', error);
      }
    };

    // Initial check
    checkDeviceType();

    // Listen for resize events
    const handleResize = () => {
      checkDeviceType();
    };
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      checkDeviceType();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}