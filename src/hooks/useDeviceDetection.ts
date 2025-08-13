import { useState, useEffect, useMemo } from 'react';
import { createBreadcrumb } from '@/lib/breadcrumb-system';

interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  screenWidth: number;
}

export function useDeviceDetection(): DeviceInfo {
  // LED breadcrumb trail for device detection
  const breadcrumb = useMemo(() => createBreadcrumb('useDeviceDetection'), []);

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTouch: false,
    screenWidth: 1024
  });

  useEffect(() => {
    const checkDeviceType = () => {
      breadcrumb.light(104, { action: 'deviceDetectionTriggered' });
      
      try {
        // Check screen width
        const screenWidth = window.innerWidth;
        const isMobileWidth = window.matchMedia('(max-width: 768px)').matches;
        
        // Check touch capability
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Combine checks for mobile detection
        const isMobile = isMobileWidth || isTouch;
        
        breadcrumb.light(105, { 
          action: 'deviceDetectionComplete',
          screenWidth,
          isMobileWidth,
          isTouch,
          finalIsMobile: isMobile,
          userAgent: navigator.userAgent,
          maxTouchPoints: navigator.maxTouchPoints
        });
        
        setDeviceInfo({
          isMobile,
          isTouch,
          screenWidth
        });
      } catch (error) {
        breadcrumb.fail(104, error as Error);
      }
    };

    // Initial check
    breadcrumb.light(106, { action: 'initialDeviceCheck' });
    checkDeviceType();

    // Listen for resize events
    const handleResize = () => {
      breadcrumb.light(107, { action: 'windowResizeDetected', newWidth: window.innerWidth });
      checkDeviceType();
    };
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      breadcrumb.light(108, { action: 'orientationChangeDetected', orientation: window.orientation });
      checkDeviceType();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      breadcrumb.light(109, { action: 'deviceDetectionCleanup' });
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [breadcrumb]);

  return deviceInfo;
}