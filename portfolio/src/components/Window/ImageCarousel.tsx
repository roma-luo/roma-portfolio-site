'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  interval?: number;
}

export default function ImageCarousel({ images, alt, interval = 3000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
        No Image
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-900">
      <AnimatePresence mode='wait'>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - ${currentIndex + 1}`}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          loading="lazy"
        />
      </AnimatePresence>
      
      {/* Progress Indicator (Optional, subtle dots) */}
      {images.length > 1 && (
         <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
             {images.map((_, idx) => (
                 <div 
                    key={idx} 
                    className={`w-1 h-1 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`}
                 />
             ))}
         </div>
      )}
    </div>
  );
}

