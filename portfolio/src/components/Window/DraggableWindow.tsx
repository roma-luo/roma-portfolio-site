'use client';

import React, { useRef, useEffect, useState, memo, useMemo } from 'react';
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
  scale?: number;
  boundaryRect?: { minX: number; maxX: number; minY: number; maxY: number };
}

const DraggableWindow = memo(function DraggableWindow({
  windowState,
  onFocus,
  onClose,
  onMinimize,
  onToggleExpand,
  onMove,
  children,
  scale = 1,
  boundaryRect,
}: DraggableWindowProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(windowState.position);

  // Single effect: detect expand/collapse transitions AND sync position.
  // By handling both in one effect, React batches setIsExpanding + setCurrentPosition
  // into the same render — so the CSS transition is active BEFORE the transform moves.
  const prevExpandedRef = useRef(windowState.isExpanded);
  const prevPositionRef = useRef(windowState.position);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    const wasExpanded = prevExpandedRef.current;
    const nowExpanded = windowState.isExpanded;
    prevExpandedRef.current = nowExpanded;
    prevPositionRef.current = windowState.position;

    if (!wasExpanded && nowExpanded) {
      // false → true: expanding — enable transform transition, then sync position
      setIsExpanding(true);
      setCurrentPosition(windowState.position);
      const t = setTimeout(() => setIsExpanding(false), 510);
      return () => clearTimeout(t);
    }
    if (wasExpanded && !nowExpanded) {
      // true → false: collapsing — enable transform transition, then sync position
      setIsCollapsing(true);
      setCurrentPosition(windowState.position);
      const t = setTimeout(() => setIsCollapsing(false), 510);
      return () => clearTimeout(t);
    }
    // Dragged or repositioned without expand/collapse change — sync position immediately
    setCurrentPosition(windowState.position);
  }, [windowState.position, windowState.isExpanded]);




  // Dimensions based on expanded state
  const width = windowState.isExpanded ? 800 : (windowState.size?.width || 400);
  const height = windowState.isExpanded ? 600 : (windowState.size?.height || 'auto');

  if (!windowState.isOpen) return null;

  const handleWindowClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    onFocus(windowState.id);
    if (!windowState.isExpanded && !windowState.isMinimized && (windowState.type === 'project' || windowState.type === 'miniWindow')) {
      onToggleExpand(windowState.id, true);
    }
  };

  const bounds = useMemo(() => {
    if (!boundaryRect) return 'parent';

    // Calculate bounds relative to the window's current size
    // Draggable bounds are: {left, top, right, bottom}
    // right/bottom are the maximum x/y values for the top-left corner
    return {
      left: boundaryRect.minX,
      top: boundaryRect.minY,
      right: boundaryRect.maxX - width,
      bottom: boundaryRect.maxY - (typeof height === 'number' ? height : 600), // Fallback if auto
    };
  }, [boundaryRect, width, height]);

  return (
    <Draggable
      handle=".window-header"
      position={currentPosition}
      nodeRef={nodeRef}
      scale={scale}
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
      bounds={bounds}
    >
      <div
        ref={nodeRef}
        data-window-id={windowState.id}
        className={`absolute flex flex-col shadow-2xl border border-white/10 will-change-transform
          ${windowState.isMinimized && windowState.type !== 'profile' ? 'h-10 overflow-hidden' : ''}
          ${!isDragging
            ? (isExpanding || isCollapsing)
              ? 'transition-[width,height,transform] duration-[280ms] ease-out'
              : 'transition-[width,height] duration-[280ms] ease-out'
            : ''
          }
        `}
        style={{
          zIndex: windowState.zIndex,
          width: windowState.isMinimized && windowState.type === 'profile' ? 'auto' : width,
          height: windowState.isMinimized ? 'auto' : height,
          background: '#121212',
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
        {(!windowState.isMinimized || windowState.type === 'profile') && (
          <div className="flex-1 overflow-auto cursor-auto relative">
            {children}
          </div>
        )}
      </div>
    </Draggable>
  );
});

export default DraggableWindow;
