'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import DesktopCanvas from '@/components/Canvas/DesktopCanvas';
import MobileCanvas from '@/components/Canvas/MobileCanvas';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="relative w-full h-full">
      {isLoading ? (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : isMobile ? (
        <MobileCanvas />
      ) : (
        <DesktopCanvas />
      )}
    </main>
  );
}
