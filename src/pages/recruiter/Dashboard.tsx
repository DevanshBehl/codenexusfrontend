import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    User,
    Video,
    GraduationCap,
    Trophy,
    Award,
    Code2,
    Briefcase,
    X,
    ChevronRight,
    Star,
    TrendingUp
} from 'lucide-react';

/* ────────── Types & Mock Data ────────── */
interface Project {
    title: string;
    description: string;
    techStack: string[];
}

interface Candidate {
    id: string;
    name: string;
    role: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'In Progress' | 'Completed';
    gender: 'male' | 'female';
    academics: string;
    cgpa: string;
    specialization: string;
    codeArenaScore: number;
    universityRank: number;
    projects: Project[];
}

const SCHEDULED_INTERVIEWS: Candidate[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        role: 'Frontend Engineer',
        date: 'Oct 25',
        time: '14:00',
        status: 'Upcoming',
        gender: 'male',
        academics: 'B.Tech in Computer Science',
        cgpa: '8.9/10',
        specialization: 'Frontend Development & UI/UX',
        codeArenaScore: 1845,
        universityRank: 12,
        projects: [
            {
                title: 'E-commerce React Dashboard',
                description: 'A full-featured admin dashboard built with React, Redux, and TailwindCSS for managing products, orders, and users.',
                techStack: ['React', 'Redux', 'TailwindCSS', 'Firebase']
            },
            {
                title: 'Real-time Chat App',
                description: 'WebSocket-based chat application with typing indicators, read receipts, and room management.',
                techStack: ['Node.js', 'Socket.io', 'React']
            }
        ]
    },
    {
        id: '2',
        name: 'Sarah Chen',
        role: 'Backend Engineer',
        date: 'Oct 26',
        time: '10:30',
        status: 'Upcoming',
        gender: 'female',
        academics: 'M.S. in Software Engineering',
        cgpa: '3.8/4.0',
        specialization: 'Distributed Systems & API Design',
        codeArenaScore: 2150,
        universityRank: 3,
        projects: [
            {
                title: 'Microservices Payment Gateway',
                description: 'Designed a resilient payment gateway using Go and gRPC, capable of handling 5000+ TPS with 99.99% uptime.',
                techStack: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Kafka']
            }
        ]
    },
    {
        id: '3',
        name: 'Michael Rodriguez',
        role: 'Full Stack Engineer',
        date: 'Oct 28',
        time: '16:00',
        status: 'Upcoming',
        gender: 'male',
        academics: 'B.S. in Information Technology',
        cgpa: '3.6/4.0',
        specialization: 'Web Applications & Database Optimization',
        codeArenaScore: 1680,
        universityRank: 45,
        projects: [
            {
                title: 'Social Media Analytics Tool',
                description: 'Full stack app aggregating social metrics, visualizing trends using D3.js and a Python backend.',
                techStack: ['Python', 'Django', 'React', 'D3.js']
            },
            {
                title: 'Task Management System',
                description: 'Kanban board application with drag-and-drop functionality and offline sync capabilities.',
                techStack: ['TypeScript', 'Next.js', 'Prisma']
            }
        ]
    }
];

/* ────────── Component ────────── */
export default function RecruiterDashboard() {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-accent-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg opacity-30" />
            
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-[#222]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-accent-500/20 border border-accent-500/50 flex items-center justify-center">
                            <span className="text-accent-400 font-bold font-mono">CN</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">Recruiter Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-accent-600 to-[#6b21a8] flex items-center justify-center text-sm font-bold shadow-xl border border-accent-500/30">
                            HR
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#888] mb-2">
                        Upcoming Interviews
                    </h2>
                    <p className="text-[#888] text-sm">Review candidate profiles before passing them to technical rounds.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SCHEDULED_INTERVIEWS.map((candidate, idx) => (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden hover:border-[#444] transition-all group flex flex-col"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-[#222] relative overflow-hidden flex-1">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                                    <User size={100} />
                                </div>
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-xl font-bold font-mono text-white/80 shadow-inner">
                                            {candidate.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-accent-400 transition-colors">
                                                {candidate.name}
                                            </h3>
                                            <p className="text-xs text-[#888] font-mono mt-0.5">{candidate.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-sm bg-accent-500/10 text-accent-400 border border-accent-500/20">
                                        {candidate.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm text-[#bbb] relative z-10">
                                    <div className="flex items-center gap-2 bg-[#111] border border-[#222] px-3 py-2 rounded-lg">
                                        <Calendar size={14} className="text-accent-500" />
                                        <span>{candidate.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-[#111] border border-[#222] px-3 py-2 rounded-lg">
                                        <Clock size={14} className="text-accent-500" />
                                        <span>{candidate.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="p-4 bg-[#080808] grid grid-cols-2 gap-3 shrink-0">
                                <button
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className="flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-lg py-2.5 text-sm font-medium transition-colors group/btn"
                                >
                                    <User size={16} className="text-[#888] group-hover/btn:text-white transition-colors" />
                                    <span>Profile</span>
                                </button>
                                <Link
                                    to="/recruiter/interview"
                                    className="flex items-center justify-center gap-2 bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 rounded-lg py-2.5 text-sm font-bold text-accent-400 transition-colors"
                                >
                                    <Video size={16} />
                                    <span>Join</span>
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Candidate Profile Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedCandidate(null)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="shrink-0 h-20 bg-gradient-to-r from-[#111] to-[#0A0A0A] border-b border-[#222] flex items-center justify-between px-6 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 text-accent-500/5 rotate-12 pointer-events-none">
                                    <Briefcase size={120} />
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-[#333] flex items-center justify-center text-2xl font-bold font-mono text-white/80 shadow-inner">
                                        {selectedCandidate.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            {selectedCandidate.name}
                                            <span className="text-[10px] bg-accent-500/20 text-accent-400 px-2 py-0.5 rounded-full font-mono font-normal uppercase tracking-widest border border-accent-500/30">
                                                Verified
                                            </span>
                                        </h2>
                                        <p className="text-sm text-[#888] font-mono">{selectedCandidate.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="p-2 bg-[#111] hover:bg-[#222] rounded-full text-[#666] hover:text-white transition-colors border border-[#333] relative z-10"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#050505] relative">
                                
                                {/* Top Stats Row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <GraduationCap size={48} />
                                        </div>
                                        <span className="text-[#888] text-xs font-mono uppercase tracking-widest relative z-10">CGPA</span>
                                        <span className="text-2xl font-bold text-white relative z-10">{selectedCandidate.cgpa}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <TrendingUp size={48} />
                                        </div>
                                        <span className="text-[#888] text-xs font-mono uppercase tracking-widest relative z-10">Score</span>
                                        <span className="text-2xl font-bold text-accent-400 relative z-10">{selectedCandidate.codeArenaScore}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <Trophy size={48} />
                                        </div>
                                        <span className="text-[#888] text-xs font-mono uppercase tracking-widest relative z-10">Uni Rank</span>
                                        <span className="text-2xl font-bold text-white relative z-10">#{selectedCandidate.universityRank}</span>
                                    </div>
                                    <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                                        <div className="absolute -right-2 -bottom-2 text-[#222] transition-transform group-hover:scale-110">
                                            <Star size={48} />
                                        </div>
                                        <span className="text-[#888] text-xs font-mono uppercase tracking-widest relative z-10">Status</span>
                                        <span className="text-lg font-bold text-green-400 relative z-10 mt-1">{selectedCandidate.status}</span>
                                    </div>
                                </div>

                                {/* Academics & Specialization */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <section>
                                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                            <Award size={16} className="text-accent-500" />
                                            Academics
                                        </h3>
                                        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
                                            <p className="font-medium text-white/90">{selectedCandidate.academics}</p>
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                            <Code2 size={16} className="text-accent-500" />
                                            Key Specialization
                                        </h3>
                                        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
                                            <p className="font-medium text-white/90">{selectedCandidate.specialization}</p>
                                        </div>
                                    </section>
                                </div>

                                {/* Projects */}
                                <section>
                                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <Briefcase size={16} className="text-accent-500" />
                                        Featured Projects ({selectedCandidate.projects.length})
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedCandidate.projects.map((project, idx) => (
                                            <div key={idx} className="bg-[#0A0A0A] border border-[#222] hover:border-[#333] rounded-xl p-5 transition-colors">
                                                <h4 className="font-bold text-white text-lg mb-2">{project.title}</h4>
                                                <p className="text-[#888] text-sm leading-relaxed mb-4">
                                                    {project.description}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {project.techStack.map(tech => (
                                                        <span key={tech} className="px-2.5 py-1 bg-[#111] border border-[#333] text-[#aaa] text-xs font-mono rounded-md">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                            </div>

                            {/* Modal Footer */}
                            <div className="shrink-0 p-5 bg-[#080808] border-t border-[#222] flex justify-end gap-3 rounded-b-2xl">
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="px-5 py-2.5 rounded-lg border border-[#333] text-sm font-medium text-[#888] hover:text-white hover:bg-[#111] transition-colors"
                                >
                                    Close
                                </button>
                                <Link
                                    to="/recruiter/interview"
                                    className="px-6 py-2.5 rounded-lg bg-accent-500/20 border border-accent-500/50 text-accent-400 font-bold text-sm hover:bg-accent-500/30 transition-colors flex items-center gap-2"
                                >
                                    Join Interview <ChevronRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global scrollbar styles for modal */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #050505;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #222;
                  border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #333;
                }
            `}} />
        </div>
    );
}
