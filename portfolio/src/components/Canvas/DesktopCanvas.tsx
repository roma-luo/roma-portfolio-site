'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DraggableWindow from '../Window/DraggableWindow';
import LocationWindowContent from '../Window/LocationWindowContent';
import Lightbox from '../Window/Lightbox';
import { WindowState } from '@/types';
import { projects, profileData, experienceData, getProjectMedia } from '@/data';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DesktopCanvas() {
  const INITIAL_WINDOWS: WindowState[] = useMemo(() => [
    {
      id: 'profile',
      title: 'Profile - Roma Luo',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      isExpanded: false,
      zIndex: 10,
      position: { x: 100, y: 100 },
      size: { width: 480, height: 600 },
      type: 'profile',
    },
    {
      id: 'awards',
      title: 'Awards',
      isOpen: true,
      isMinimized: true,
      isMaximized: false,
      isExpanded: false,
      zIndex: 13,
      position: { x: 100, y: 720 },
      size: { width: 280, height: 310 },
      type: 'awards',
    },
    {
      id: 'contact',
      title: 'Contact',
      isOpen: true,
      isMinimized: true,
      isMaximized: false,
      isExpanded: false,
      zIndex: 12,
      position: { x: 100, y: 770 },
      size: { width: 280, height: 250 },
      type: 'contact',
    },
    {
      id: 'experience',
      title: 'Professional Experience',
      isOpen: true,
      isMinimized: true,
      isMaximized: false,
      isExpanded: false,
      zIndex: 11,
      position: { x: 100, y: 820 },
      size: { width: 280, height: 400 },
      type: 'experience',
    },
    {
      id: 'location',
      title: 'Location',
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      isExpanded: false,
      zIndex: 10,
      position: { x: 1670, y: 120 },
      size: { width: 500, height: 240 },
      type: 'location',
    },
    ...projects.map((p, i) => {
      // Determine category based on index (as per instruction)
      // p1-p5 (indices 0-4) -> research/computation
      // p6-p10 (indices 5-9) -> architectural design

      let x, y;

      // Layout logic: 
      // Research Group: Top Right area
      // Design Group: Bottom Right area
      // Stacked/Grid feel like a folder content

      if (i < 5) {
        // Research/Computation Group
        // Start at x=650, y=100
        // Layout: 3 in first row, 2 in second row for compact "folder" look
        const row = Math.floor(i / 3);
        const col = i % 3;
        x = 650 + col * 340;
        y = 120 + row * 260;
      } else {
        // Architectural Design Group
        // Start at x=650, y=700 (pushed down)
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
        isMaximized: false,
        isExpanded: false,
        zIndex: i + 1,
        position: { x, y },
        size: { width: 320, height: 240 },
        type: 'project' as const,
        projectId: p.id,
      };
    }),
  ], []);

  const [windows, setWindows] = useState<WindowState[]>(INITIAL_WINDOWS);
  const [lightboxMedia, setLightboxMedia] = useState<{ src: string; alt: string } | null>(null);

  const handleFocus = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      return prev.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
    });
  }, []);

  const handleClose = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w))
    );
  }, []);

  const handleMinimize = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      )
    );
  }, []);

  const handleToggleExpand = useCallback((id: string, isExpanded: boolean) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        const maxZ = Math.max(...prev.map(win => win.zIndex));
        return { ...w, isExpanded, zIndex: isExpanded ? maxZ + 1 : w.zIndex };
      }
      return w;
    }));
  }, []);

  return (
    <motion.div
      className="relative w-full h-full bg-[#1E1E1E] overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Optional: Grid or Texture Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Category Labels (Folder Headers) */}
      <div className="absolute top-[60px] left-[650px] pointer-events-none select-none">
        <h2 className="text-white/20 text-6xl font-bold uppercase tracking-tighter">
          Research /<br />Computation
        </h2>
      </div>

      <div className="absolute top-[660px] left-[650px] pointer-events-none select-none">
        <h2 className="text-white/20 text-6xl font-bold uppercase tracking-tighter">
          Architectural<br />Design
        </h2>
      </div>

      {windows.map((win) => (
        <DraggableWindow
          key={win.id}
          windowState={win}
          onFocus={handleFocus}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onToggleExpand={handleToggleExpand}
        >
          {win.type === 'profile' ? (
            <div className="p-4 flex gap-4">
              {/* Left side: Text content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
                  <p className="text-lg text-gray-300">{profileData.title}</p>
                  <p className="text-sm text-gray-400 mt-1 font-light">{profileData.intro}</p>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-white/10 text-xs">
                        {skill}
                      </span>
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

              {/* Right side: Profile photo */}
              <div className="shrink-0">
                <img
                  src="/images/profile/roma.jpg"
                  alt="Roma Luo"
                  className="w-32 h-32 object-cover border-2 border-white/20"
                />
              </div>
            </div>
          ) : win.type === 'contact' ? (
            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-xl font-bold mb-3">Get in Touch</h2>
                <p className="text-gray-300 text-xs mb-4 font-light">
                  Feel free to reach out for collaborations, opportunities, or just to connect.
                </p>
              </div>

              <div className="flex items-center gap-6 justify-center">
                <a
                  href="mailto:roma.luo@outlook.com"
                  className="hover:opacity-70 transition-opacity flex flex-col items-center gap-2 group"
                  title="Email: roma.luo@outlook.com"
                >
                  <div className="p-3 bg-white/5 group-hover:bg-white/10 transition-colors">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400">Email</span>
                </a>

                <a
                  href="https://www.linkedin.com/in/roma-luo-519b73274/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity flex flex-col items-center gap-2 group"
                  title="LinkedIn Profile"
                >
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
              <div>
                <h2 className="text-xl font-bold mb-3">Awards & Recognition</h2>
              </div>

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
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background-color: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background-color: rgba(255, 255, 255, 0.3);
                }
              `}</style>

              <div>
                <h2 className="text-xl font-bold mb-1">Professional Experience</h2>
                <p className="text-xs text-gray-400">Career History & Roles</p>
              </div>

              <div className="space-y-6">
                {experienceData.map((job, i) => (
                  <div key={i} className="relative pl-4 border-l border-white/20">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1E1E1E] border border-white/40"></div>

                    <div className="mb-1">
                      <h3 className="font-bold text-sm">{job.role}</h3>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-blue-300 font-medium">{job.company}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{job.period}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-light">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : win.type === 'location' ? (
            <LocationWindowContent />
          ) : (
            <ProjectWindowContent
              win={win}
              onImageClick={(src, alt) => setLightboxMedia({ src, alt })}
            />
          )}
        </DraggableWindow>
      ))}

      <Lightbox
        isOpen={!!lightboxMedia}
        src={lightboxMedia?.src || ''}
        alt={lightboxMedia?.alt || ''}
        onClose={() => setLightboxMedia(null)}
      />
    </motion.div>
  );
}

// Separate component for project content to improve performance
function ProjectWindowContent({ win, onImageClick }: { win: WindowState; onImageClick?: (src: string, alt: string) => void }) {
  const project = useMemo(() => projects.find(p => p.id === win.projectId), [win.projectId]);
  const media = useMemo(() => project ? getProjectMedia(project.id) : [], [project]);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!project) return <div className="p-4">Project not found</div>;

  // First media item for collapsed view
  const firstMedia = media[0] || project.thumbnail;
  const isVideoCollapsed = firstMedia?.endsWith('.mp4');

  // Current media for expanded view
  const currentMedia = media[currentIndex] || firstMedia;
  const isVideoExpanded = currentMedia?.endsWith('.mp4');

  const handleNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {!win.isExpanded ? (
        // Collapsed State: First media only
        <div className="relative w-full h-full">
          {firstMedia ? (
            isVideoCollapsed ? (
              <video
                src={firstMedia}
                className="w-full h-full object-cover pointer-events-none"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img
                src={firstMedia}
                alt={project.title}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors flex items-end p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
            <div>
              <h3 className="text-white font-bold text-lg drop-shadow-md">{project.title}</h3>
              <p className="text-gray-200 text-xs line-clamp-1 drop-shadow-md font-light">{project.shortDescription}</p>
            </div>
          </div>
        </div>
      ) : (
        // Expanded State: Vertical layout (top: image, bottom: details)
        <div className="h-full bg-transparent flex flex-col">
          {/* Top: Image Canvas with Navigation */}
          <div className="h-[60%] relative bg-black flex items-center justify-center shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {isVideoExpanded ? (
                  <video
                    src={currentMedia}
                    controls
                    className="max-w-full max-h-full cursor-pointer hover:opacity-90 transition-opacity"
                    playsInline
                    onClick={() => currentMedia && onImageClick?.(currentMedia, project.title)}
                    title="Click to expand"
                  />
                ) : (
                  <img
                    src={currentMedia}
                    alt={`${project.title} - ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    loading="lazy"
                    onClick={() => currentMedia && onImageClick?.(currentMedia, project.title)}
                    title="Click to expand"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {media.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 transition-all duration-200 z-10"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {currentIndex < media.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 transition-all duration-200 z-10"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}

                {/* Counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 border border-white/10 z-10">
                  {currentIndex + 1} / {media.length}
                </div>
              </>
            )}
          </div>

          {/* Bottom: Project Details */}
          <div
            className="flex-1 p-6 space-y-6 overflow-y-auto border-t border-white/10"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#000000 transparent'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background-color: #000000;
                border-radius: 0;
              }
              div::-webkit-scrollbar-thumb:hover {
                background-color: #1a1a1a;
              }
            `}</style>

            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-300 font-light">{project.shortDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Role</span>
                {project.content?.role}
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Tech</span>
                <div className="flex flex-wrap gap-1">
                  {project.content?.technologies.map(t => (
                    <span key={t} className="bg-white/10 px-1.5 py-0.5 text-xs">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none">
              <p className="font-light">{project.content?.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
