import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Terminal, Building2, Users, FileText, CheckSquare, Mail, Presentation,
    Calendar, Video, Building, Lock,
    Code2, Play, CheckCircle2, MessageSquare, Briefcase, PenTool, 
    BarChart3, FileBarChart, Box
} from 'lucide-react';
import { webinarApi, type WebinarItem } from '../../lib/api';

/* ────────── Types ────────── */
interface WebinarListProps {
    userRole: 'STUDENT' | 'UNIVERSITY';
}

export default function WebinarList({ userRole }: WebinarListProps) {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [webinars, setWebinars] = useState<WebinarItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWebinars = async () => {
            try {
                setLoading(true);
                const res = await webinarApi.getAll();
                setWebinars(res.data || []);
            } catch (error) {
                console.error("Failed to fetch webinars", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWebinars();
    }, []);

    // Update current time every minute to re-evaluate the 5-min rule
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const studentSidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/student/mail') },
        { icon: Presentation, label: 'WEBINARS', active: true, onClick: () => navigate('/student/webinars') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/student/dashboard') },
        { icon: Code2, label: 'CODE ARENA', onClick: () => navigate('/student/codearena') },
        { icon: PenTool, label: 'DESIGN ARENA', onClick: () => navigate('/student/designarena') },
        { icon: Briefcase, label: 'INTERVIEWS', onClick: () => navigate('/student/interview') },
        { icon: FileText, label: 'PROFILE', onClick: () => window.location.href = '/student/profile' },
        { icon: Box, label: 'PROJECTS', onClick: () => navigate('/student/projects') },
    ];

    const universitySidebarItems = [
        { icon: Mail, label: 'MAIL', onClick: () => navigate('/university/mail') },
        { icon: Presentation, label: 'WEBINARS', active: true, onClick: () => navigate('/university/webinars') },
        { icon: Terminal, label: 'CMD CENTER', onClick: () => navigate('/university/dashboard') },
        { icon: Building2, label: 'COMPANIES', onClick: () => navigate('/university/dashboard') },
        { icon: Users, label: 'STUDENTS', onClick: () => navigate('/university/dashboard') },
        { icon: Briefcase, label: 'PLACEMENTS', onClick: () => navigate('/university/dashboard') },
        { icon: CheckCircle2, label: 'EVALUATIONS', onClick: () => navigate('/university/evaluation') },
        { icon: BarChart3, label: 'ANALYTICS', onClick: () => navigate('/university/dashboard') },
        { icon: FileBarChart, label: 'REPORTS', onClick: () => navigate('/university/dashboard') },
    ];

    const sidebarItems = userRole === 'STUDENT' ? studentSidebarItems : universitySidebarItems;

    // Logic: True if scheduled time is within 5 minutes from now, or already started.
    const canJoinWebinar = (dateStr: string, timeStr: string) => {
        const scheduledTime = new Date(`${dateStr}T${timeStr}:00`);
        const timeDiffMs = scheduledTime.getTime() - currentTime.getTime();
        const diffMinutes = timeDiffMs / (1000 * 60);

        // Can join if it's 5 mins or less until start, or if it already started (diffMinutes <= 5)
        // Note: For a real app we'd also check if the webinar has ended (duration elapsed)
        return diffMinutes <= 5;
    };

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white flex overflow-hidden">
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 240 : 70 }}
                className="h-screen bg-[#0A0A0A] border-r border-[#222] flex flex-col relative shrink-0 z-20"
            >
                <div className="h-16 flex items-center px-4 border-b border-[#222]">
                    <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
                        <span>{'<'}</span>
                        <AnimatePresence>
                            {isSidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    cn/
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <span>{'>'}</span>
                    </Link>
                </div>

                <div className="flex-1 py-6 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                    <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest px-3 mb-2">{userRole} Options</div>
                    {sidebarItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={`flex items-center px-3 py-2.5 rounded-sm transition-all duration-200 group relative
                                ${item.active
                                    ? 'bg-[#111] border border-[#333] border-l-2 border-l-accent-500 text-white'
                                    : 'border border-transparent text-[#888] hover:bg-[#111] hover:border-[#222] hover:text-white'
                                }`}
                        >
                            <item.icon size={16} className={`min-w-[16px] ${item.active ? 'text-accent-400' : 'group-hover:text-white transition-colors'}`} />
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        className="ml-3 font-mono text-[10px] uppercase tracking-widest whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    ))}
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
                <header className="h-16 border-b border-[#222] bg-[#0A0A0A]/80 backdrop-blur-md flex items-center px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Presentation size={20} className="text-accent-400" />
                        <div>
                            <h1 className="text-sm font-bold font-sans text-white uppercase tracking-widest">Pre-Placement Talks</h1>
                            <p className="text-[10px] font-mono text-[#666]">Join scheduled webinars by top companies</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {loading ? (
                            <div className="text-center py-16 text-[#555] font-mono text-xs uppercase tracking-widest">
                                Loading webinars...
                            </div>
                        ) : webinars.length === 0 ? (
                            <div className="text-center py-16 text-[#555] font-mono text-xs uppercase tracking-widest">
                                No webinars scheduled yet
                            </div>
                        ) : (
                        webinars.map(webinar => {
                            const scheduledDate = new Date(webinar.scheduledAt);
                            const dateStr = scheduledDate.toISOString().split('T')[0];
                            const timeStr = scheduledDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                            const isJoinable = canJoinWebinar(dateStr, timeStr);
                            const isUpcoming = webinar.status === 'UPCOMING';
                            
                            return (
                                <div key={webinar.id} className="bg-[#0A0A0A] border border-[#222] rounded-sm p-6 flex flex-col md:flex-row gap-6 hover:border-[#333] transition-colors shadow-lg">
                                    <div className="md:w-1/4 shrink-0 flex flex-col justify-center items-center p-4 bg-[#111] border border-[#222] rounded-sm relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-16 h-16 rotate-45 translate-x-8 -translate-y-8 ${isUpcoming ? 'bg-accent-500/5' : 'bg-[#222]/20'}`}></div>
                                        <Calendar size={24} className={isUpcoming ? 'text-accent-400 mb-2' : 'text-[#555] mb-2'} />
                                        <span className="text-sm font-bold text-white tracking-widest font-mono">{scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                                        <span className="text-[10px] font-mono text-[#888] mt-1">{timeStr} ({webinar.durationMins} mins)</span>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className={`text-lg font-bold font-sans ${isUpcoming ? 'text-white' : 'text-[#888]'}`}>{webinar.title}</h3>
                                                <p className="text-[10px] font-mono text-accent-500 uppercase tracking-widest">{webinar.company.name}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[9px] font-mono border rounded-sm tracking-widest uppercase ${isUpcoming ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-[#555] border-[#333] bg-[#111]'}`}>
                                                {webinar.status}
                                            </span>
                                        </div>
                                        
                                        <p className="text-xs text-[#888] font-sans leading-relaxed mb-4 line-clamp-2">
                                            {webinar.agenda}
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center gap-4 mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Building size={14} className="text-[#555]" />
                                                <div className="flex gap-1">
                                                    {webinar.targetUniversities.map((tu) => (
                                                        <span key={tu.university.id} className="text-[10px] font-mono text-[#aaa] bg-[#1a1a1a] px-1.5 py-0.5 rounded-sm border border-[#333]">
                                                            {tu.university.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {isUpcoming && (
                                                <button 
                                                    onClick={() => navigate(`/student/webinar/${webinar.id}`)}
                                                    disabled={!isJoinable}
                                                    className={`ml-auto text-[10px] font-mono font-bold flex items-center gap-2 px-4 py-2 rounded-sm outline-none transition-all ${
                                                        isJoinable
                                                        ? 'bg-accent-500 text-black hover:bg-accent-400 shadow-[0_0_15px_rgba(var(--accent-500),0.3)]'
                                                        : 'bg-[#111] text-[#555] border border-[#333] cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isJoinable ? (
                                                        <><Video size={14} /> Join Webinar</>
                                                    ) : (
                                                        <><Lock size={14} /> Opens 5 Mins Before</>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
