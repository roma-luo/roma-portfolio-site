'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LightboxProps {
    media: string[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    alt?: string;
}

export default function Lightbox({ media, currentIndex: initialIndex, isOpen, onClose, alt = 'Image' }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Update current index when prop changes
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < media.length - 1) {
                setCurrentIndex(prev => prev + 1);
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, currentIndex, media.length]);

    if (!isOpen || !media.length) return null;

    const currentSrc = media[currentIndex];
    const isVideo = currentSrc?.endsWith('.mp4');

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < media.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                        aria-label="Close"
                    >
                        <X size={32} />
                    </button>

                    {/* Navigation Arrows */}
                    {media.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrev();
                                    }}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 transition-all duration-200 z-50"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                            )}
                            {currentIndex < media.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNext();
                                    }}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 transition-all duration-200 z-50"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            )}
                        </>
                    )}

                    {/* Media Counter */}
                    {media.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 border border-white/10 z-50">
                            {currentIndex + 1} / {media.length}
                        </div>
                    )}

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isVideo ? (
                                <video
                                    key={currentSrc}
                                    src={currentSrc}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                                />
                            ) : (
                                <img
                                    src={currentSrc}
                                    alt={`${alt} - ${currentIndex + 1}`}
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
