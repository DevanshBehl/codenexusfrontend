import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Briefcase,
    Building2,
    GraduationCap,
    MapPin,
    Calendar,
    ChevronLeft,
    Terminal,
    Settings,
    Shield,
    Code,
    Globe,
    Github
} from 'lucide-react';
import { api } from '../../lib/api';

interface PublicProfile {
    id: string;
    cnid: string;
    role: string;
    createdAt: string;
    profile: {
        name?: string;
        branch?: string;
        cgpa?: number;
        specialization?: string;
        university?: { name: string };
        projects?: {
            id: string;
            title: string;
            description: string;
            techStack: string;
            githubLink: string | null;
            liveLink: string | null;
            imageUrl: string | null;
        }[];
        codeArenaScore?: number;
        status?: string;
        location?: string;
        tier?: number;
        industry?: string;
        description?: string;
        company?: { name: string };
    };
    stats: {
        codeArenaScore: number | null;
        problemsSolved: number;
    };
}

const StaticProfile = () => {
    const { cnid } = useParams<{ cnid: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cnid) {
            setLoading(true);
            api.get<PublicProfile>(`/user/${cnid}/profile`, false)
                .then(res => {
                    setProfile(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message || 'Failed to load profile');
                    setLoading(false);
                });
        }
    }, [cnid]);

    const getRoleIcon = () => {
        switch (profile?.role) {
            case 'STUDENT': return <GraduationCap size={48} />;
            case 'UNIVERSITY': return <Building2 size={48} />;
            case 'COMPANY_ADMIN': return <Briefcase size={48} />;
            case 'RECRUITER': return <User size={48} />;
            default: return <User size={48} />;
        }
    };

    const getRoleTitle = () => {
        switch (profile?.role) {
            case 'STUDENT': return 'Student Profile';
            case 'UNIVERSITY': return 'University Profile';
            case 'COMPANY_ADMIN': return 'Company Profile';
            case 'RECRUITER': return 'Recruiter Profile';
            default: return 'User Profile';
        }
    };

    const getDisplayName = () => {
        return profile?.profile?.name ||
            profile?.profile?.company?.name ||
            'CodeNexus User';
    };

    const getInitials = () => {
        const name = getDisplayName();
        return name.charAt(0).toUpperCase();
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex flex-col items-center justify-center px-4">
                <div className="animate-pulse text-accent-500 font-mono text-sm">Loading profile...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex flex-col items-center justify-center px-4">
                <div className="text-red-500 font-mono text-sm">{error || 'Profile not found'}</div>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 flex items-center gap-2 text-[#888] hover:text-white transition-colors text-xs font-mono"
                >
                    <ChevronLeft size={14} /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex flex-col items-center py-12 px-4 md:px-8">
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-[300px] bg-accent-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-4xl relative z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-8 group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] border border-[#222] rounded-sm p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-500 to-transparent"></div>

                    <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-500 pointer-events-none">
                        {getRoleIcon()}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-[#222] pb-8 mb-8">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#111] border border-[#333] rounded-sm flex items-center justify-center text-4xl font-bold font-mono text-accent-400 shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            {getInitials()}
                        </div>

                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-accent-400 rounded-sm mb-3 font-mono tracking-widest uppercase">
                                <Shield size={10} />
                                {profile.role}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold font-sans text-white mb-2 tracking-tight">
                                {getDisplayName()}
                            </h1>
                            <p className="text-sm font-mono text-[#888] flex items-center gap-2">
                                <Code size={14} /> CNID: {profile.cnid}
                            </p>
                        </div>
                    </div>

                    {profile.role === 'STUDENT' && profile.profile && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-[#111] border border-[#222] p-6 rounded-sm hover:border-[#333] transition-colors relative group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#333] to-transparent group-hover:via-accent-500/50 transition-all"></div>
                                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                                        <GraduationCap size={14} className="text-accent-500" /> Academic Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Branch</p>
                                            <p className="text-sm font-bold text-white">{profile.profile.branch || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">CGPA</p>
                                            <p className="text-sm font-bold text-white">{profile.profile.cgpa || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">University</p>
                                            <p className="text-sm font-bold text-white">{profile.profile.university?.name || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#111] border border-[#222] p-6 rounded-sm hover:border-[#333] transition-colors relative group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#333] to-transparent group-hover:via-accent-500/50 transition-all"></div>
                                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                                        <Terminal size={14} className="text-accent-500" /> Code Arena Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Score</p>
                                            <p className="text-sm font-bold text-white">{profile.profile.codeArenaScore || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Status</p>
                                            <p className="text-sm font-bold text-white">{profile.profile.status || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Specialization</p>
                                            <p className="text-sm font-bold text-white">{profile.profile.specialization || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {profile.profile.projects && profile.profile.projects.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                                        <Briefcase size={14} className="text-accent-500" /> Projects
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {profile.profile.projects.map(project => (
                                            <div key={project.id} className="bg-[#111] border border-[#222] p-4 rounded-sm hover:border-[#333] transition-colors">
                                                <h4 className="text-white font-bold mb-2">{project.title}</h4>
                                                <p className="text-xs text-[#888] mb-3 line-clamp-2">{project.description}</p>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {project.techStack.split(',').map((tech, i) => (
                                                        <span key={i} className="text-[10px] font-mono bg-[#222] text-accent-400 px-2 py-1 rounded-sm">
                                                            {tech.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-4">
                                                    {project.githubLink && (
                                                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer"
                                                           className="text-xs text-[#888] hover:text-white flex items-center gap-1">
                                                            <Github size={12} /> GitHub
                                                        </a>
                                                    )}
                                                    {project.liveLink && (
                                                        <a href={project.liveLink} target="_blank" rel="noopener noreferrer"
                                                           className="text-xs text-[#888] hover:text-white flex items-center gap-1">
                                                            <Globe size={12} /> Live
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="mt-8 pt-8 border-t border-[#222] text-center">
                        <p className="text-xs font-mono text-[#555] uppercase tracking-widest">
                            Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StaticProfile;