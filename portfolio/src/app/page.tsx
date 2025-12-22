'use client';

import { useState } from 'react';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import DesktopCanvas from '@/components/Canvas/DesktopCanvas';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="relative w-full h-full">
      {isLoading ? (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : (
        <DesktopCanvas />
      )}
      </main>
  );
}
