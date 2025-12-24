'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { projects, profileData, experienceData, getProjectMedia } from '@/data';
import LocationWindowContent from '../Window/LocationWindowContent';

export default function MobileCanvas() {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['profile', 'contact'])
    );
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const researchProjects = projects.filter(p => p.category === 'research/computation');
    const designProjects = projects.filter(p => p.category === 'architectural design');

    return (
        <div className="w-full h-full bg-[#1E1E1E] overflow-y-auto overflow-x-hidden">
            {/* Optional: Grid Background */}
            <div className="fixed inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative z-10 pb-20">
                {/* Profile Section */}
                <Section
                    title="Profile"
                    isExpanded={expandedSections.has('profile')}
                    onToggle={() => toggleSection('profile')}
                >
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <img
                                src="/images/profile/roma.jpg"
                                alt="Roma Luo"
                                className="w-24 h-24 object-cover border-2 border-white/20 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold mb-1">{profileData.name}</h1>
                                <p className="text-base text-gray-300">{profileData.title}</p>
                                <p className="text-sm text-gray-400 mt-2 font-light">{profileData.intro}</p>
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Skills</h3>
                            <div className="space-y-4">
                                {Object.entries(profileData.skills).map(([category, skills]) => (
                                    <div key={category}>
                                        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{category}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map(skill => (
                                                <span key={skill} className="px-2 py-1 bg-white/10 text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">Education</h3>
                            {profileData.education.map((edu, i) => (
                                <div key={i} className="text-sm mb-2">
                                    <div className="font-medium">{edu.school}</div>
                                    <div className="text-gray-400">{edu.degree}, {edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Contact Section */}
                <Section
                    title="Contact"
                    isExpanded={expandedSections.has('contact')}
                    onToggle={() => toggleSection('contact')}
                >
                    <div className="space-y-4">
                        <p className="text-gray-300 text-sm font-light">
                            Feel free to reach out for collaborations, opportunities, or just to connect.
                        </p>
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
                </Section>

                {/* Experience Section */}
                <Section
                    title="Professional Experience"
                    isExpanded={expandedSections.has('experience')}
                    onToggle={() => toggleSection('experience')}
                >
                    <div className="space-y-6">
                        {experienceData.map((job, i) => (
                            <div key={i} className="relative pl-4 border-l border-white/20">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1E1E1E] border border-white/40"></div>
                                <div className="mb-1">
                                    <h3 className="font-bold text-sm">{job.role}</h3>
                                    <div className="flex justify-between items-baseline flex-wrap gap-1">
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
                </Section>

                {/* Awards Section */}
                <Section
                    title="Awards & Recognition"
                    isExpanded={expandedSections.has('awards')}
                    onToggle={() => toggleSection('awards')}
                >
                    <div className="space-y-3 text-sm">
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
                </Section>

                {/* Location Section */}
                <Section
                    title="Location"
                    isExpanded={expandedSections.has('location')}
                    onToggle={() => toggleSection('location')}
                >
                    <div className="h-64">
                        <LocationWindowContent />
                    </div>
                </Section>

                {/* Research/Computation Projects */}
                <Section
                    title="Research / Computation"
                    isExpanded={expandedSections.has('research')}
                    onToggle={() => toggleSection('research')}
                    titleClassName="text-xl"
                >
                    <div className="grid grid-cols-1 gap-4">
                        {researchProjects.map(project => (
                            <MobileProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedProject(project.id)}
                            />
                        ))}
                    </div>
                </Section>

                {/* Architectural Design Projects */}
                <Section
                    title="Architectural Design"
                    isExpanded={expandedSections.has('design')}
                    onToggle={() => toggleSection('design')}
                    titleClassName="text-xl"
                >
                    <div className="grid grid-cols-1 gap-4">
                        {designProjects.map(project => (
                            <MobileProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => setSelectedProject(project.id)}
                            />
                        ))}
                    </div>
                </Section>
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
                <ProjectDetailModal
                    projectId={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
}

// Section Component
function Section({
    title,
    isExpanded,
    onToggle,
    children,
    titleClassName = "text-lg"
}: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    titleClassName?: string;
}) {
    return (
        <div className="border-b border-white/10">
            <button
                onClick={onToggle}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors active:bg-white/10"
            >
                <h2 className={`font-bold text-white ${titleClassName}`}>{title}</h2>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-6">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Mobile Project Card Component
function MobileProjectCard({ project, onClick }: { project: any; onClick: () => void }) {
    const firstMedia = getProjectMedia(project.id)[0] || project.thumbnail;
    const isVideo = firstMedia?.endsWith('.mp4');

    return (
        <div
            onClick={onClick}
            className="relative bg-black/30 border border-white/10 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div className="relative aspect-[4/3]">
                {isVideo ? (
                    <video
                        src={firstMedia}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <img
                        src={firstMedia}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <div>
                        <h3 className="text-white font-bold text-base">{project.title}</h3>
                        <p className="text-gray-200 text-xs line-clamp-2 mt-1 font-light">{project.shortDescription}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Project Detail Modal
function ProjectDetailModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
    const project = projects.find(p => p.id === projectId);
    const media = getProjectMedia(projectId);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!project) return null;

    const currentMedia = media[currentIndex] || project.thumbnail;
    const isVideo = currentMedia?.endsWith('.mp4');

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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 overflow-y-auto"
        >
            <div className="min-h-full">
                {/* Header */}
                <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold truncate pr-4">{project.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 transition-colors shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Image Gallery */}
                <div className="relative bg-black">
                    <div className="aspect-[4/3] flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                {isVideo ? (
                                    <video
                                        src={currentMedia}
                                        controls
                                        className="max-w-full max-h-full"
                                        playsInline
                                    />
                                ) : (
                                    <img
                                        src={currentMedia}
                                        alt={`${project.title} - ${currentIndex + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                        loading="lazy"
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    {media.length > 1 && (
                        <>
                            {currentIndex > 0 && (
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            {currentIndex < media.length - 1 && (
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}

                            {/* Counter */}
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 border border-white/10">
                                {currentIndex + 1} / {media.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Project Details */}
                <div className="p-6 space-y-6">
                    <div className="border-b border-white/10 pb-4">
                        <h3 className="text-xl font-bold mb-2">{project.title}</h3>
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
        </motion.div>
    );
}
