'use client';

import React, { useRef, useEffect, useState, memo } from 'react';
import Draggable from 'react-draggable';
import { X, Minus } from 'lucide-react';
import { WindowState } from '@/types';

interface DraggableWindowProps {
  windowState: WindowState;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onToggleExpand: (id: string, isExpanded: boolean) => void;
  onMove?: (id: string, position: { x: number; y: number }) => void;
  children: React.ReactNode;
}

const DraggableWindow = memo(function DraggableWindow({
  windowState,
  onFocus,
  onClose,
  onMinimize,
  onToggleExpand,
  onMove,
  children,
}: DraggableWindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(windowState.position);

  // Sync position when windowState changes (e.g. smart expansion shift)
  useEffect(() => {
    setCurrentPosition(windowState.position);
  }, [windowState.position]);

  useEffect(() => {
    if (!windowState.isOpen || !windowState.isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        onToggleExpand(windowState.id, false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [windowState.isExpanded, windowState.id, windowState.isOpen, onToggleExpand]);

  // Dimensions based on expanded state
  const width = windowState.isExpanded ? 800 : (windowState.size?.width || 400);
  const height = windowState.isExpanded ? 600 : (windowState.size?.height || 'auto');

  if (!windowState.isOpen) return null;

  const handleWindowClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    onFocus(windowState.id);
    if (!windowState.isExpanded && !windowState.isMinimized && windowState.type === 'project') {
      onToggleExpand(windowState.id, true);
    }
  };

  return (
    <Draggable
      handle=".window-header"
      position={currentPosition}
      nodeRef={nodeRef}
      onStart={() => {
        onFocus(windowState.id);
        setIsDragging(true);
      }}
      onDrag={(e, data) => {
        setCurrentPosition({ x: data.x, y: data.y });
      }}
      onStop={(e, data) => {
        setTimeout(() => setIsDragging(false), 50);
        onMove?.(windowState.id, { x: data.x, y: data.y });
      }}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={`absolute flex flex-col shadow-2xl border border-white/10 will-change-transform
          ${windowState.isMinimized ? 'h-10 overflow-hidden' : ''}
          ${!isDragging ? 'transition-[width,height,transform] duration-500 ease-out' : ''}
        `}
        style={{
          zIndex: windowState.zIndex,
          width: width,
          height: windowState.isMinimized ? 'auto' : height,
          background: windowState.type === 'contact'
            ? 'linear-gradient(135deg, rgba(50, 50, 50, 0.5) 0%, rgba(80, 80, 80, 0.5) 100%)'
            : 'var(--window-bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'white',
        }}
        onClick={handleWindowClick}
      >
        {/* Header / Title Bar */}
        <div
          className="window-header flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing bg-white/5 border-b border-white/10 select-none"
        >
          <span className="font-bold text-sm tracking-wide truncate pr-4">
            {windowState.title}
          </span>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }}
              className="p-1 hover:bg-white/10 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Minus size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }}
              className="p-1 hover:bg-red-500/80 transition-colors"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!windowState.isMinimized && (
          <div className="flex-1 overflow-auto cursor-auto relative">
            {children}
          </div>
        )}
      </div>
    </Draggable>
  );
});

export default DraggableWindow;
