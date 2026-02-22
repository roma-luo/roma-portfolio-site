'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_URLS = [
  '/images/projects/p1-1.mp4',
  '/images/projects/p3-1.mp4',
  '/images/projects/p3-4.mp4',
];

const MAX_LOADING_TIME = 6000; // Max wait time in ms

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let didFinish = false;

    const finish = () => {
      if (didFinish) return;
      didFinish = true;
      setIsVisible(false);
    };

    // Preload all videos via fetch (puts them in browser cache)
    const preloadPromises = VIDEO_URLS.map((url) =>
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return res.blob(); // Read the full body to ensure it's cached
        })
        .catch((err) => {
          console.warn('Video preload failed:', err);
        })
    );

    // Wait for all videos to load, then dismiss
    Promise.all(preloadPromises).then(finish);

    // Safety timeout: never wait longer than MAX_LOADING_TIME
    const timer = setTimeout(finish, MAX_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait" onExitComplete={onLoadingComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="h-3 w-3 rounded-full bg-black"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: index * 0.4,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
