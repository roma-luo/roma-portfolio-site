'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableWindow from '../Window/DraggableWindow';
import LocationWindowContent from '../Window/LocationWindowContent';
import Lightbox from '../Window/Lightbox';
import { WindowState } from '@/types';
import { projects, profileData, experienceData, getProjectMedia, getProjectSections, miniWindows } from '@/data';
import { X } from 'lucide-react';

// Temporal popup spawned when a section tab is clicked
interface TemporalPopup {
  id: string;
  mediaSrc: string;
  offsetIndex: number; // for stagger delay
  ownerWindowId: string;
  x: number;
  y: number;
  zIndex: number; // managed so last-dragged stays on top
}

export default function DesktopCanvas() {
  const INITIAL_WINDOWS: WindowState[] = useMemo(() => [
    {
      id: 'profile',
      title: 'Profile',
      isOpen: true,
      isMinimized: true,
      isExpanded: false,
      zIndex: 10,
      position: { x: 20, y: 120 },
      size: { width: 480, height: 690 },
      type: 'profile',
    },
    {
      id: 'awards',
      title: 'Awards',
      isOpen: true,
      isMinimized: true,
      isExpanded: false,
      zIndex: 13,
      position: { x: 20, y: 290 },
      size: { width: 280, height: 310 },
      type: 'awards',
    },
    {
      id: 'contact',
      title: 'Contact',
      isOpen: true,
      isMinimized: true,
      isExpanded: false,
      zIndex: 12,
      position: { x: 20, y: 360 },
      size: { width: 280, height: 250 },
      type: 'contact',
    },
    {
      id: 'experience',
      title: 'Professional Experience',
      isOpen: true,
      isMinimized: true,
      isExpanded: false,
      zIndex: 11,
      position: { x: 20, y: 430 },
      size: { width: 280, height: 400 },
      type: 'experience',
    },
    {
      id: 'location',
      title: 'Location',
      isOpen: true,
      isMinimized: false,
      isExpanded: false,
      zIndex: 10,
      position: { x: 1670, y: 120 },
      size: { width: 500, height: 240 },
      type: 'location',
    },
    ...projects.map((p, i) => {
      let x, y;
      if (i < 5) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        x = 650 + col * 340;
        y = 120 + row * 260;
      } else {
        const idx = i - 5;
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        x = 650 + col * 340;
        y = 720 + row * 260;
      }
      return {
        id: `project-${p.id}`,
        title: p.title,
        isOpen: true,
        isMinimized: false,
        isExpanded: false,
        zIndex: i + 1,
        position: { x, y },
        size: { width: 320, height: 240 },
        type: 'project' as const,
        projectId: p.id,
      };
    }),
    ...miniWindows.map((mw, i) => {
      const x = 650 + i * 340;
      const y = 1320;
      return {
        id: mw.id,
        title: mw.title,
        isOpen: true,
        isMinimized: false,
        isExpanded: false,
        zIndex: projects.length + i + 1,
        position: { x, y },
        size: { width: 320, height: 240 },
        type: 'miniWindow' as const,
        parentProjectId: mw.parentProjectId,
        mediaSrc: mw.mediaSrc,
      };
    }),
  ], []);

  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [lightboxMedia, setLightboxMedia] = useState<{ media: string[]; currentIndex: number; alt: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [boundaryRect, setBoundaryRect] = useState<{ minX: number; maxX: number; minY: number; maxY: number } | undefined>(undefined);
  const [temporalPopups, setTemporalPopups] = useState<TemporalPopup[]>([]);
  const [projectInfoOverlay, setProjectInfoOverlay] = useState<string | null>(null);

  const windowsRef = useRef<WindowState[]>(INITIAL_WINDOWS);
  windowsRef.current = windows;
  const lightboxRef = useRef(lightboxMedia);
  lightboxRef.current = lightboxMedia;
  // Ref so onSectionClick (passed as inline prop) never stales on popup count
  const temporalPopupsRef = useRef<TemporalPopup[]>([]);
  temporalPopupsRef.current = temporalPopups;
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks in-flight preload so we can cancel when the user switches sections quickly
  const preloadAbortRef = useRef<{ cancelled: boolean } | null>(null);
  // IDs of windows we minimized when a section tab was clicked — restored on collapse
  const [sectionMinimizedIds, setSectionMinimizedIds] = useState<string[]>([]);
  const sectionMinimizedIdsRef = useRef<string[]>([]);
  sectionMinimizedIdsRef.current = sectionMinimizedIds;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lightboxRef.current) return;

      const target = event.target as Element;
      if (target.closest('[data-temporal-popup]')) return;
      if (target.closest('[data-project-info-overlay]')) return;

      const clickedWindowId = target.closest('[data-window-id]')?.getAttribute('data-window-id') ?? null;

      const wins = windowsRef.current;
      const expanded = wins.filter(w => w.isOpen && w.isExpanded);
      if (expanded.length === 0) return;

      const groups = new Map<string, Set<string>>();
      expanded.forEach((w: WindowState) => {
        const groupKey = w.type === 'project' ? w.id
          : w.type === 'miniWindow' && w.parentProjectId ? `project-${w.parentProjectId}`
            : w.id;
        if (!groups.has(groupKey)) groups.set(groupKey, new Set());
        groups.get(groupKey)!.add(w.id);
        if (w.type === 'miniWindow' && w.parentProjectId) {
          groups.get(groupKey)!.add(`project-${w.parentProjectId}`);
        }
      });

      groups.forEach((memberIds) => {
        const clickedInsideGroup = clickedWindowId !== null && memberIds.has(clickedWindowId);
        if (!clickedInsideGroup) {
          const representativeId = [...memberIds][0];
          if (representativeId) {
            setWindows(prev => {
              const win = prev.find(w => w.id === representativeId);
              if (!win || !win.isExpanded) return prev;
              // Restore any windows we minimized via section-click
              const toRestore = new Set(sectionMinimizedIdsRef.current);
              return prev.map((w: WindowState) => {
                if (toRestore.has(w.id)) return { ...w, isMinimized: false };
                if (!memberIds.has(w.id) || !w.isExpanded) return w;
                const restoredPosition = w.preExpandPosition ?? w.position;
                return { ...w, isExpanded: false, position: restoredPosition, preExpandPosition: undefined };
              });
            });
            setSectionMinimizedIds([]);
            setTemporalPopups([]);
            setProjectInfoOverlay(null);
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const BASE_WIDTH = 2300;
      const MAX_WIDTH = 1920;
      const targetWidth = Math.min(width, MAX_WIDTH);
      const newScale = targetWidth / BASE_WIDTH;
      setScale(newScale);
      const visibleWidthScaled = width / newScale;
      const visibleHeightScaled = height / newScale;
      const offsetX = (visibleWidthScaled - BASE_WIDTH) / 2;
      setBoundaryRect({
        minX: -offsetX,
        maxX: BASE_WIDTH + offsetX,
        minY: 0,
        maxY: visibleHeightScaled
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFocus = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      return prev.map((w) => w.id === id ? { ...w, zIndex: maxZ + 1 } : w);
    });
  }, []);

  const handleClose = useCallback((id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  }, []);

  const handleMinimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => w.id === id ? { ...w, isMinimized: !w.isMinimized, isExpanded: false } : w)
    );
  }, []);

  const handleMove = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, position } : w)));
  }, []);

  const computeExpandPosition = useCallback((w: WindowState, expandedWidth: number, expandedHeight: number) => {
    const PADDING = 20;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const BASE_WIDTH = 2300;
    const MAX_WIDTH = 1920;
    const targetWidth = Math.min(width, MAX_WIDTH);
    const currentScale = targetWidth / BASE_WIDTH;
    const visibleWidthScaled = width / currentScale;
    const visibleHeightScaled = height / currentScale;
    const offsetX = (visibleWidthScaled - BASE_WIDTH) / 2;
    const minX = -offsetX;
    const maxX = BASE_WIDTH + offsetX;
    const minY = 0;
    const maxY = visibleHeightScaled;
    let x = w.position.x;
    let y = w.position.y;
    if (x + expandedWidth > maxX - PADDING) x = Math.max(minX + PADDING, maxX - expandedWidth - PADDING);
    if (y + expandedHeight > maxY - PADDING) y = Math.max(minY + PADDING, maxY - expandedHeight - PADDING);
    if (x < minX + PADDING) x = minX + PADDING;
    if (y < minY + PADDING) y = minY + PADDING;
    return { x, y };
  }, []);

  const handleToggleExpand = useCallback((id: string, isExpanded: boolean) => {
    const expandOne = (prev: WindowState[], targetId: string): WindowState[] => {
      const maxZ = Math.max(...prev.map(w => w.zIndex));
      return prev.map(w => {
        if (w.id !== targetId) return w;
        const newPosition = computeExpandPosition(w, 800, 600);
        return { ...w, isExpanded: true, zIndex: maxZ + 1, preExpandPosition: w.position, position: newPosition };
      });
    };

    if (!isExpanded) {
      setTemporalPopups([]);
      setProjectInfoOverlay(null);
      // Restore any windows minimized by a section-click
      if (sectionMinimizedIdsRef.current.length > 0) {
        const toRestore = new Set(sectionMinimizedIdsRef.current);
        setWindows(prev => prev.map(w => toRestore.has(w.id) ? { ...w, isMinimized: false } : w));
        setSectionMinimizedIds([]);
      }
    }

    setWindows(prev => {
      const targetWindow = prev.find(w => w.id === id);
      if (!targetWindow) return prev;
      const maxZ = Math.max(...prev.map(win => win.zIndex));

      if (targetWindow.type === 'miniWindow' && targetWindow.parentProjectId && isExpanded) {
        const parentId = `project-${targetWindow.parentProjectId}`;
        return expandOne(prev, parentId);
      }

      const linkedIds = new Set<string>([id]);
      if (targetWindow.type === 'miniWindow' && targetWindow.parentProjectId) {
        linkedIds.add(`project-${targetWindow.parentProjectId}`);
        prev.forEach(w => {
          if (w.type === 'miniWindow' && w.parentProjectId === targetWindow.parentProjectId)
            linkedIds.add(w.id);
        });
      } else if (targetWindow.type === 'project' && targetWindow.projectId) {
        prev.forEach(w => {
          if (w.type === 'miniWindow' && w.parentProjectId === targetWindow.projectId)
            linkedIds.add(w.id);
        });
      }

      return prev.map(w => {
        if (!linkedIds.has(w.id)) return w;
        if (isExpanded) {
          const newPosition = computeExpandPosition(w, 800, 600);
          return { ...w, isExpanded: true, zIndex: maxZ + 1, preExpandPosition: w.position, position: newPosition };
        } else {
          const restoredPosition = w.preExpandPosition ?? w.position;
          return { ...w, isExpanded: false, position: restoredPosition, preExpandPosition: undefined };
        }
      });
    });

    if (isExpanded && id.startsWith('mini-')) {
      setTimeout(() => setWindows(prev => expandOne(prev, id)), 350);
    }
  }, [computeExpandPosition]);

  return (
    <motion.div
      className="relative w-full h-full bg-[#0F0F0F] overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >


      <div className="w-full h-full flex justify-center overflow-hidden" style={{ alignItems: 'flex-start' }}>
        <div
          className="relative shrink-0 origin-top"
          style={{
            width: 2300,
            height: '100%',
            minHeight: 1800,
            transform: `scale(${scale})`,
            marginBottom: -1200 * (1 - scale),
            // Isolate this subtree so window resize/collapse animations
            // don't trigger a full-document layout reflow every frame
            contain: 'layout',
            isolation: 'isolate',
          }}
        >
          <div className="absolute top-[60px] left-[650px] pointer-events-none select-none">
            <h2 className="text-white/20 text-6xl font-medium uppercase tracking-tighter" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Research /<br />Computation
            </h2>
          </div>

          <div className="absolute top-[660px] left-[650px] pointer-events-none select-none">
            <h2 className="text-white/20 text-6xl font-medium uppercase tracking-tighter" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Architectural<br />Design
            </h2>
          </div>

          {windows.filter(w => w.isOpen).map((win) => (
            <DraggableWindow
              key={win.id}
              windowState={win}
              onFocus={handleFocus}
              onClose={handleClose}
              onMinimize={handleMinimize}
              onToggleExpand={handleToggleExpand}
              onMove={handleMove}
              scale={scale}
              boundaryRect={boundaryRect}
            >
              {win.type === 'profile' ? (
                win.isMinimized ? (
                  // Minimized / compact profile card
                  <div className="px-4 pt-2 pb-4">
                    <h1 className="text-xl font-bold leading-tight">{profileData.name}</h1>
                    <p className="text-sm text-gray-300 mt-0.5">{profileData.title}</p>
                    <p className="text-xs text-gray-400 mt-2 font-light leading-relaxed">{profileData.intro}</p>
                  </div>
                ) : (
                  // Full profile
                  <div className="p-4 flex gap-4">
                    <div className="flex-1 space-y-6">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                        <p className="text-lg text-gray-300">{profileData.title}</p>
                        <p className="text-sm text-gray-400 mt-1 font-light">{profileData.intro}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Skills</h3>
                        <div className="space-y-4">
                          {Object.entries(profileData.skills).map(([category, skills]) => (
                            <div key={category}>
                              <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{category}</h4>
                              <div className="flex flex-wrap gap-2">
                                {skills.map(skill => (
                                  <span key={skill} className="px-2 py-1 bg-white/10 text-xs hover:bg-white/20 transition-colors cursor-default">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Education</h3>
                        {profileData.education.map((edu, i) => (
                          <div key={i} className="text-sm">
                            <div className="font-medium">{edu.school}</div>
                            <div className="text-gray-400">{edu.degree}, {edu.year}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <img src="/images/profile/roma.jpg" alt="Roma Luo" className="w-32 h-32 object-cover border-2 border-white/20" />
                    </div>
                  </div>
                )
              ) : win.type === 'contact' ? (
                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="text-xl font-bold mb-3">Get in Touch</h2>
                    <p className="text-gray-300 text-xs mb-4 font-light">Feel free to reach out for collaborations, opportunities, or just to connect.</p>
                  </div>
                  <div className="flex items-center gap-6 justify-center">
                    <a href="mailto:roma.luo@outlook.com" className="hover:opacity-70 transition-opacity flex flex-col items-center gap-2 group" title="Email: roma.luo@outlook.com">
                      <div className="p-3 bg-white/5 group-hover:bg-white/10 transition-colors">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-400">Email</span>
                    </a>
                    <a href="https://www.linkedin.com/in/roma-luo-519b73274/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity flex flex-col items-center gap-2 group" title="LinkedIn Profile">
                      <div className="p-3 bg-white/5 group-hover:bg-white/10 transition-colors">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-400">LinkedIn</span>
                    </a>
                  </div>
                </div>
              ) : win.type === 'awards' ? (
                <div className="p-4 space-y-3">
                  <h2 className="text-xl font-bold mb-3">Awards & Recognition</h2>
                  <div className="space-y-2 text-sm">
                    <div className="border-l-2 border-white/30 pl-3 py-1">
                      <div className="font-semibold">Light-Weight Structure Association Australasia Competition 2025</div>
                      <div className="text-gray-400 text-xs">2025</div>
                    </div>
                    <div className="border-l-2 border-white/30 pl-3 py-1">
                      <div className="font-semibold">Lemon Grasui Graduate Exhibition Award</div>
                      <div className="text-gray-400 text-xs">2025</div>
                    </div>
                    <div className="border-l-2 border-white/30 pl-3 py-1">
                      <div className="font-semibold">Best Undergraduate Thesis Award</div>
                      <div className="text-gray-400 text-xs">2023</div>
                    </div>
                  </div>
                </div>
              ) : win.type === 'experience' ? (
                <div className="p-5 space-y-5 h-full overflow-y-auto custom-scrollbar">
                  <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(255,255,255,0.3); }
                  `}</style>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Professional Experience</h2>
                    <p className="text-xs text-gray-400">Career History & Roles</p>
                  </div>
                  <div className="space-y-6">
                    {experienceData.map((job, i) => (
                      <div key={i} className="relative pl-4 border-l border-white/20">
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#121212] border border-white/40"></div>
                        <div className="mb-1">
                          <h3 className="font-bold text-sm">{job.role}</h3>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs text-blue-300 font-medium">{job.company}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{job.period}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed font-light">{job.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : win.type === 'location' ? (
                <LocationWindowContent />
              ) : win.type === 'miniWindow' ? (
                <MiniWindowContent
                  win={win}
                  onImageClick={(media, index, alt) => setLightboxMedia({ media, currentIndex: index, alt })}
                />
              ) : (
                <ProjectWindowContent
                  win={win}
                  onImageClick={(media, index, alt) => setLightboxMedia({ media, currentIndex: index, alt })}
                  onSectionClick={(sectionMedia, windowId, description) => {
                    if (description !== undefined) {
                      // Project Info: clear popups, show text overlay
                      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
                      setTemporalPopups([]);
                      setProjectInfoOverlay(description);
                      return;
                    }
                    setProjectInfoOverlay(null);

                    // Minimize all OTHER open project/mini windows (excluding the active project's group)
                    const activeWin = windowsRef.current.find(w => w.id === windowId);
                    const activeProjectId = activeWin?.projectId;
                    const toMinimize = windowsRef.current.filter(w =>
                      w.isOpen &&
                      !w.isMinimized &&
                      (w.type === 'project' || w.type === 'miniWindow' ||
                        w.type === 'location' || w.type === 'awards' ||
                        w.type === 'contact' || w.type === 'experience') &&
                      w.id !== windowId &&
                      !(w.type === 'miniWindow' && w.parentProjectId === activeProjectId)
                    );
                    if (toMinimize.length > 0) {
                      const ids = toMinimize.map(w => w.id);
                      // Only add ones not already tracked
                      setSectionMinimizedIds(prev => {
                        const existing = new Set(prev);
                        const newIds = ids.filter(id => !existing.has(id));
                        return newIds.length > 0 ? [...prev, ...newIds] : prev;
                      });
                      setWindows(prev => prev.map(w => ids.includes(w.id) ? { ...w, isMinimized: true } : w));
                    }

                    // Compute random positions in canvas-space
                    const vw = window.innerWidth;
                    const vh = window.innerHeight;
                    const BASE_W = 2300;
                    const MAX_W = 1920;
                    const sc = Math.min(vw, MAX_W) / BASE_W;
                    const visW = vw / sc;
                    const visH = vh / sc;
                    const offX = (visW - BASE_W) / 2;
                    // Popup assumed max size for bounds checking
                    const PW = 800, PH = 620, PAD = 40, MIN_GAP = 80;
                    const minX = -offX + PAD, maxX = BASE_W + offX - PW - PAD;
                    const minY = PAD, maxY = visH - PH - PAD;

                    const positions: { x: number; y: number }[] = [];
                    for (let i = 0; i < sectionMedia.length; i++) {
                      let x = 0, y = 0, attempts = 0;
                      do {
                        x = minX + Math.random() * Math.max(1, maxX - minX);
                        y = minY + Math.random() * Math.max(1, maxY - minY);
                        attempts++;
                      } while (
                        attempts < 60 &&
                        positions.some(p => Math.abs(p.x - x) < MIN_GAP && Math.abs(p.y - y) < MIN_GAP)
                      );
                      positions.push({ x, y });
                    }

                    const newPopups: TemporalPopup[] = sectionMedia.map((src, i) => ({
                      id: `${windowId}-popup-${Date.now()}-${i}`,
                      mediaSrc: src,
                      offsetIndex: i,
                      ownerWindowId: windowId,
                      x: positions[i].x,
                      y: positions[i].y,
                      zIndex: 8000 + i,
                    }));

                    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);

                    // Cancel any previous preload so rapid section-switching doesn't pile up
                    if (preloadAbortRef.current) preloadAbortRef.current.cancelled = true;
                    const abortToken = { cancelled: false };
                    preloadAbortRef.current = abortToken;

                    // showPopups: defers to switchTimerRef if previous popups need to exit first
                    const showPopups = () => {
                      if (abortToken.cancelled) return;
                      if (temporalPopupsRef.current.length > 0) {
                        // Let existing popups animate out first, then bring in the new batch
                        setTemporalPopups([]);
                        switchTimerRef.current = setTimeout(() => {
                          if (!abortToken.cancelled) setTemporalPopups(newPopups);
                        }, 220);
                      } else {
                        setTemporalPopups(newPopups);
                      }
                    };

                    // Strategy 3: Only fire the animation once every image is loaded.
                    // If Strategy 1 already pre-fetched them, this resolves instantly from cache.
                    // Videos are excluded — they stream and can't be fully preloaded here.
                    const imagesToWait = sectionMedia.filter(src => !src.endsWith('.mp4'));
                    if (imagesToWait.length === 0) {
                      // Section is video-only — show immediately
                      showPopups();
                    } else {
                      Promise.all(
                        imagesToWait.map(
                          src => new Promise<void>(resolve => {
                            const img = new Image();
                            img.onload = () => resolve();
                            img.onerror = () => resolve(); // don't block on a broken asset
                            img.src = src;
                          })
                        )
                      ).then(showPopups);
                    }
                  }}
                />
              )}
            </DraggableWindow>
          ))}

          <AnimatePresence>
            {temporalPopups.map((popup) => (
              <TemporalPopupCard
                key={popup.id}
                popup={popup}
                onClose={() => setTemporalPopups(prev => prev.filter(p => p.id !== popup.id))}
                onBringToFront={() => {
                  setTemporalPopups(prev => {
                    const maxZ = Math.max(...prev.map(p => p.zIndex));
                    return prev.map(p => p.id === popup.id ? { ...p, zIndex: maxZ + 1 } : p);
                  });
                }}
                onImageClick={(src) => setLightboxMedia({
                  media: temporalPopups.map(p => p.mediaSrc),
                  currentIndex: temporalPopups.findIndex(p => p.mediaSrc === src),
                  alt: 'Media',
                })}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {projectInfoOverlay !== null && (
          <ProjectInfoOverlay
            text={projectInfoOverlay}
            onClose={() => setProjectInfoOverlay(null)}
          />
        )}
      </AnimatePresence>

      <Lightbox
        isOpen={!!lightboxMedia}
        media={lightboxMedia?.media || []}
        currentIndex={lightboxMedia?.currentIndex || 0}
        alt={lightboxMedia?.alt || ''}
        onClose={() => setLightboxMedia(null)}
      />
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Project window content
// ──────────────────────────────────────────────
function ProjectWindowContent({
  win,
  onImageClick,
  onSectionClick,
}: {
  win: WindowState;
  onImageClick?: (media: string[], index: number, alt: string) => void;
  onSectionClick?: (sectionMedia: string[], windowId: string, description?: string) => void;
}) {
  const project = useMemo(() => projects.find(p => p.id === win.projectId), [win.projectId]);
  const thumbnail = useMemo(() => project ? getProjectMedia(project.id) : [], [project]);
  const sections = useMemo(() => project ? getProjectSections(project.id) : {}, [project]);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!win.isExpanded) {
      setActiveSection(null);
      return;
    }
    // Strategy 1: When the window expands, silently pre-fetch every section image
    // so they are already in the browser cache by the time the user clicks a button.
    if (!project) return;
    const allSectionMedia = Object.values(sections).flat();
    allSectionMedia.forEach(src => {
      if (src.endsWith('.mp4')) return; // skip videos — too large to prefetch
      const img = new Image();
      img.src = src; // browser caches automatically; zero cost on re-read
    });
  }, [win.isExpanded, sections, project]);

  if (!project) return <div className="p-4">Project not found</div>;

  const firstMedia = thumbnail[0] || project.thumbnail;
  const isVideoThumb = firstMedia?.endsWith('.mp4');
  const sectionNames = Object.keys(sections);

  const handleSectionClick = (name: string) => {
    setActiveSection(name);
    if (name === 'Project Info') {
      onSectionClick?.([], win.id, project.content?.description ?? '');
    } else {
      onSectionClick?.(sections[name] ?? [], win.id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!win.isExpanded ? (
        <div className="relative w-full h-full">
          {firstMedia ? (
            isVideoThumb ? (
              <video src={firstMedia} className="w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline preload="auto" />
            ) : (
              <img src={firstMedia} alt={project.title} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">No Image</div>
          )}
        </div>
      ) : (
        // Expanded: image fills full window, tabs float over bottom
        <div className="relative h-full w-full overflow-hidden">
          {/* Cover media — full bleed */}
          {firstMedia ? (
            isVideoThumb ? (
              <video src={firstMedia} className="w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline preload="auto" />
            ) : (
              <img src={firstMedia} alt={project.title} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">No Image</div>
          )}

          {/* Section tabs — overlaid, auto white/black via mix-blend-mode */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex gap-0 flex-wrap" style={{ mixBlendMode: 'difference' }}>
            <button
              onClick={(e) => { e.stopPropagation(); handleSectionClick('Project Info'); }}
              className={`px-4 py-2 text-xs uppercase tracking-widest transition-all duration-200 border-b-2 mr-1 ${activeSection === 'Project Info' ? 'border-white text-white' : 'border-transparent text-white hover:text-white/80'
                }`}
            >
              Project Info
            </button>
            {sectionNames.map(name => (
              <button
                key={name}
                onClick={(e) => { e.stopPropagation(); handleSectionClick(name); }}
                className={`px-4 py-2 text-xs uppercase tracking-widest transition-all duration-200 border-b-2 mr-1 ${activeSection === name ? 'border-white text-white' : 'border-transparent text-white hover:text-white/80'
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Temporal popup card
// ──────────────────────────────────────────────
function TemporalPopupCard({
  popup, onClose, onBringToFront, onImageClick,
}: {
  popup: TemporalPopup;
  onClose: () => void;
  onBringToFront: () => void;
  onImageClick: (src: string) => void;
}) {
  const isVideo = popup.mediaSrc.endsWith('.mp4');
  const enterDelay = popup.offsetIndex * 0.15;
  // Track whether the last gesture was a drag to suppress click-to-lightbox
  const isDragging = useRef(false);

  const handleMediaClick = () => {
    if (isDragging.current) return;
    onImageClick(popup.mediaSrc);
  };

  return (
    <motion.div
      data-temporal-popup="true"
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => { isDragging.current = true; onBringToFront(); }}
      onDragEnd={() => { setTimeout(() => { isDragging.current = false; }, 50); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // Exit is opacity-only (no scale) — keeps framer-motion off the composite
      // thread and avoids JS-driven frame updates for potentially N popups at once
      transition={{ duration: 0.15, ease: 'easeOut', delay: enterDelay }}
      className="absolute overflow-hidden shadow-2xl group"
      style={{
        left: popup.x,
        top: popup.y,
        maxWidth: 800,
        maxHeight: 620,
        width: 'fit-content',
        height: 'fit-content',
        zIndex: popup.zIndex,
        cursor: 'grab',
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.02, zIndex: 9000 }}
    >
      {/* Close button — appears on hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-2 right-2 z-10 p-1 bg-black/60 text-white/60 hover:text-white hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
      // backdropFilter removed — each popup's blur is recalculated every frame
      // during exit animations, costing O(N) blur compositing passes
      >
        <X size={14} />
      </button>
      {isVideo ? (
        <video
          src={popup.mediaSrc}
          className="block"
          style={{ maxWidth: 800, maxHeight: 620, width: 'auto', height: 'auto', pointerEvents: 'none' }}
          autoPlay loop muted playsInline preload="auto"
        />
      ) : (
        <img
          src={popup.mediaSrc}
          alt=""
          className="block select-none"
          style={{ maxWidth: 800, maxHeight: 620, width: 'auto', height: 'auto', pointerEvents: 'none' }}
          draggable={false}
          loading="lazy"
        />
      )}
      {/* Invisible click overlay on top so drag doesn't conflict with media events */}
      <div
        className="absolute inset-0"
        onClick={handleMediaClick}
        style={{ cursor: 'inherit' }}
      />
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Project Info overlay
// ──────────────────────────────────────────────
function ProjectInfoOverlay({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <motion.div
      data-project-info-overlay="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[5000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="max-w-2xl px-12 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white/90 leading-relaxed font-light" style={{ fontSize: '1.05rem', letterSpacing: '0.01em' }}>
          {text}
        </p>
        <button onClick={onClose} className="mt-10 text-white/30 text-xs uppercase tracking-widest hover:text-white/60 transition-colors">
          close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Mini window content
// ──────────────────────────────────────────────
function MiniWindowContent({ win, onImageClick }: { win: WindowState; onImageClick?: (media: string[], index: number, alt: string) => void }) {
  const mediaSrc = win.mediaSrc || '';
  const isVideo = mediaSrc.endsWith('.mp4');
  if (!mediaSrc) return <div className="p-4">No media</div>;

  return (
    <div className="h-full flex flex-col">
      {!win.isExpanded ? (
        <div className="relative w-full h-full">
          {isVideo ? (
            <video src={mediaSrc} className="w-full h-full object-cover pointer-events-none" autoPlay loop muted playsInline preload="auto" />
          ) : (
            <img src={mediaSrc} alt={win.title} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
          )}
        </div>
      ) : (
        <div className="h-full bg-black flex items-center justify-center">
          {isVideo ? (
            <video src={mediaSrc} autoPlay muted loop controls className="max-w-full max-h-full cursor-pointer hover:opacity-90 transition-opacity" playsInline preload="auto" onClick={() => onImageClick?.([mediaSrc], 0, win.title)} title="Click to expand" />
          ) : (
            <img src={mediaSrc} alt={win.title} className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-90 transition-opacity" loading="lazy" onClick={() => onImageClick?.([mediaSrc], 0, win.title)} title="Click to expand" />
          )}
        </div>
      )}
    </div>
  );
}
