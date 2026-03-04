'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import DesktopCanvas from '@/components/Canvas/DesktopCanvas';
import MobileCanvas from '@/components/Canvas/MobileCanvas';
import { preloadAssets } from '@/lib/preloadAssets';

/**
 * First-screen critical assets: only the thumbnails visible in the initial
 * window grid and the profile image. Lightbox / section media loads lazily.
 */
const CRITICAL_ASSETS = [
  // Project thumbnails (shown immediately in the window grid)
  '/images/projects/p1-1.mp4',
  '/images/projects/p2-1.jpg',
  '/images/projects/p3-1.mp4',
  '/images/projects/p4-1.png',
  '/images/projects/p5-1.png',
  '/images/projects/p6-1.png',
  '/images/projects/p7-1.jpg',
  '/images/projects/p8-1.png',
  '/images/projects/p9-1.png',
  '/images/projects/p10-1.jpg',
  // Mini-window videos
  '/images/projects/p3-extra-1.mp4',
  '/images/projects/p2-extra-1.mp4',
  '/images/projects/p1-extra-1.mp4',
  // Profile photo
  '/images/profile/roma.jpg',
];

export default function Home() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Kick off asset preloading immediately
  useEffect(() => {
    const cancel = preloadAssets(
      CRITICAL_ASSETS,
      (ratio) => setLoadingProgress(ratio),
      () => setLoadingProgress(1),
    );
    return cancel;
  }, []);

  return (
    <main className="relative w-full h-full">
      {isLoading ? (
        <LoadingScreen
          progress={loadingProgress}
          onLoadingComplete={() => setIsLoading(false)}
        />
      ) : isMobile ? (
        <MobileCanvas />
      ) : (
        <DesktopCanvas />
      )}
    </main>
  );
}
