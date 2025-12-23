'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
    id: string;
    name: string;
    x: number; // Percentage from left
    y: number; // Percentage from top
}

const LOCATIONS: Location[] = [
    { id: 'hk', name: 'Hong Kong', x: 79, y: 40 },
    { id: 'mel', name: 'Melbourne', x: 88, y: 82 },
    { id: 'tyo', name: 'Tokyo', x: 86, y: 32 },
    { id: 'gz', name: 'Guangzhou', x: 80, y: 38 },
    { id: 'sh', name: 'Shanghai', x: 82, y: 29 },
];

export default function LocationWindowContent() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full bg-[#e5e5e5] overflow-hidden group">
            {/* Map Background */}
            <img
                src="/images/world_map.png"
                alt="World Map"
                className="w-full h-full object-cover opacity-80 grayscale contrast-125"
                draggable={false}
            />

            {/* Pins */}
            {LOCATIONS.map((loc) => (
                <div
                    key={loc.id}
                    className="absolute w-3 h-3 bg-white shadow-sm cursor-help transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform duration-200 z-10"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                    onMouseEnter={() => setHoveredId(loc.id)}
                    onMouseLeave={() => setHoveredId(null)}
                >
                    {/* Tooltip */}
                    <AnimatePresence>
                        {hoveredId === loc.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs whitespace-nowrap pointer-events-none z-20"
                            >
                                {loc.name}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
