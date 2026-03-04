'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TARGET_TEXT = 'roma luo';
const BG_COLOR = '#0a0a0a';

const REVEAL_DELAY = 300;    // ms before pixel animation starts
const ANIM_DURATION = 1200;  // ms for pixelation → crisp
const START_BLOCK = 64;      // initial pixel block size

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface LoadingScreenProps {
  /** 0–1 asset loading progress driven by the parent */
  progress: number;
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ progress, onLoadingComplete }: LoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animDone, setAnimDone] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // ── Pixel-decode animation (60fps via rAF) ──────────────────────────────
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

    const imgData = offCtx.getImageData(0, 0, W * dpr, H * dpr);
    const pixels = imgData.data;
    const srcW = Math.round(W * dpr);
    const srcH = Math.round(H * dpr);

    const render = (blockSize: number) => {
      ctx.clearRect(0, 0, W, H);
      if (blockSize <= 1) {
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
            const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
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
      const t = Math.min((now - startTime) / ANIM_DURATION, 1);
      render(START_BLOCK * (1 - easeOut(t)) + 1 * easeOut(t));
      if (t < 1) {
        rafId = requestAnimationFrame(loop);
      } else {
        render(1);
        if (!done) { done = true; setAnimDone(true); }
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

  // ── Exit gate: wait for BOTH decode done AND assets 100% loaded ─────────
  useEffect(() => {
    if (animDone && progress >= 1) {
      const timer = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [animDone, progress]);

  return (
    <AnimatePresence mode="wait" onExitComplete={onLoadingComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: BG_COLOR }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
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
