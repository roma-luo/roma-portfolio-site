'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VIDEO_URLS = [
  '/images/projects/p1-1.mp4',
  '/images/projects/p3-1.mp4',
  '/images/projects/p3-4.mp4',
];

const MAX_LOADING_TIME = 6000;
const TARGET_TEXT = 'roma luo';
const BG_COLOR = '#0a0a0a';

const REVEAL_DELAY = 500;    // ms before animation starts
const ANIM_DURATION = 1200;  // ms to go from fully pixelated → crisp
const START_BLOCK = 64;      // initial pixel block size (coarse)

// Cubic ease-out: starts fast, decelerates as it approaches clarity
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [animDone, setAnimDone] = useState(false);

  // Preload videos
  useEffect(() => {
    let didFinish = false;
    const finish = () => {
      if (didFinish) return;
      didFinish = true;
      setAssetsReady(true);
    };
    const preloadPromises = VIDEO_URLS.map((url) =>
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch ${url}`);
          return res.blob();
        })
        .catch((err) => console.warn('Video preload failed:', err))
    );
    Promise.all(preloadPromises).then(finish);
    const timer = setTimeout(finish, MAX_LOADING_TIME);
    return () => clearTimeout(timer);
  }, []);

  // 60fps pixel-decode via requestAnimationFrame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Render crisp text to offscreen once
    const offscreen = document.createElement('canvas');
    offscreen.width = W * dpr;
    offscreen.height = H * dpr;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    offCtx.scale(dpr, dpr);

    const fontSize = Math.round(Math.min(W, H) * 0.020);
    offCtx.font = `300 ${fontSize}px Calibri, "Segoe UI", system-ui, sans-serif`;
    offCtx.fillStyle = '#ffffff';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(TARGET_TEXT, W / 2, H / 2);

    // Cache raw pixel data for block-sampling
    const imgData = offCtx.getImageData(0, 0, W * dpr, H * dpr);
    const pixels = imgData.data;
    const srcW = Math.round(W * dpr);
    const srcH = Math.round(H * dpr);

    /**
     * Render the text at a given pixelation level.
     * blockSize=1 → draw the offscreen directly (full resolution).
     * blockSize>1 → sample the offscreen at block intervals and paint squares.
     */
    const render = (blockSize: number) => {
      ctx.clearRect(0, 0, W, H);

      if (blockSize <= 1) {
        // Draw the offscreen at logical size (1 offscreen px = 1 canvas px after DPR scale)
        ctx.drawImage(offscreen, 0, 0, W, H);
        return;
      }

      const bs = Math.ceil(blockSize);
      const cols = Math.ceil(W / bs);
      const rows = Math.ceil(H / bs);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const sx = Math.min(Math.round((col * bs + bs / 2) * dpr), srcW - 1);
          const sy = Math.min(Math.round((row * bs + bs / 2) * dpr), srcH - 1);
          const idx = (sy * srcW + sx) * 4;
          const a = pixels[idx + 3];
          if (a > 15) {
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            ctx.fillStyle = `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
            ctx.fillRect(col * bs, row * bs, bs, bs);
          }
        }
      }
    };

    let rafId: number;
    let startTime: number | null = null;
    let done = false;

    const loop = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(elapsed / ANIM_DURATION, 1);
      const easedT = easeOut(t);

      // Block size goes from START_BLOCK → 1 as t goes 0 → 1
      const blockSize = START_BLOCK * (1 - easedT) + 1 * easedT;
      render(blockSize);

      if (t < 1) {
        rafId = requestAnimationFrame(loop);
      } else {
        // Final crisp frame
        render(1);
        if (!done) {
          done = true;
          setAnimDone(true);
        }
      }
    };

    const startTimer = setTimeout(() => {
      rafId = requestAnimationFrame(loop);
    }, REVEAL_DELAY);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Exit once animation + assets both done
  useEffect(() => {
    if (animDone && assetsReady) {
      const timer = setTimeout(() => setIsVisible(false), 700);
      return () => clearTimeout(timer);
    }
  }, [animDone, assetsReady]);

  return (
    <AnimatePresence mode="wait" onExitComplete={onLoadingComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: BG_COLOR }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.0, ease: 'easeInOut' } }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
