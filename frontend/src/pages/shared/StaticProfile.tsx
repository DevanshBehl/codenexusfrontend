import { useAuth } from '../../lib/auth';
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
    Shield
} from 'lucide-react';

const StaticProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const getRoleIcon = () => {
        switch (user?.role) {
            case 'STUDENT': return <GraduationCap size={48} />;
            case 'UNIVERSITY': return <Building2 size={48} />;
            case 'COMPANY_ADMIN': return <Briefcase size={48} />;
            case 'RECRUITER': return <User size={48} />;
            default: return <User size={48} />;
        }
    };

    const getRoleTitle = () => {
        switch (user?.role) {
            case 'STUDENT': return 'Student Profile';
            case 'UNIVERSITY': return 'University Profile';
            case 'COMPANY_ADMIN': return 'Company Profile';
            case 'RECRUITER': return 'Recruiter Profile';
            default: return 'User Profile';
        }
    };

    const getDashboardPath = () => {
        switch (user?.role) {
            case 'STUDENT': return '/student/dashboard';
            case 'UNIVERSITY': return '/university/dashboard';
            case 'COMPANY_ADMIN': return '/company/dashboard';
            case 'RECRUITER': return '/recruiter/dashboard';
            default: return '/';
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex flex-col items-center py-12 px-4 md:px-8">
            {/* Background Details */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl h-[300px] bg-accent-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-4xl relative z-10">
                {/* Navigation */}
                <button 
                    onClick={() => navigate(getDashboardPath())}
                    className="flex items-center gap-2 text-[#888] hover:text-white transition-colors text-xs font-mono uppercase tracking-widest mb-8 group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to Dashboard
                </button>

                {/* Main Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0A0A0A] border border-[#222] rounded-sm p-8 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-500 to-transparent"></div>
                    
                    {/* Header Banner */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-accent-500 pointer-events-none">
                        {getRoleIcon()}
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-[#222] pb-8 mb-8">
                        {/* Profile Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#111] border border-[#333] rounded-sm flex items-center justify-center text-4xl font-bold font-mono text-accent-400 shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            {user?.name?.charAt(0) || 'U'}
                        </div>

                        {/* Name and Role */}
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-2 py-1 text-[10px] text-accent-400 rounded-sm mb-3 font-mono tracking-widest uppercase">
                                <Shield size={10} />
                                {user?.role || 'USER'}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold font-sans text-white mb-2 tracking-tight">
                                {user?.name || 'Authorized User'}
                            </h1>
                            <p className="text-sm font-mono text-[#888] flex items-center gap-2">
                                <Mail size={14} /> {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#111] border border-[#222] p-6 rounded-sm hover:border-[#333] transition-colors relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#333] to-transparent group-hover:via-accent-500/50 transition-all"></div>
                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                                <Terminal size={14} className="text-accent-500" /> Account Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Entity Name</p>
                                    <p className="text-sm font-bold text-white">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Access Level</p>
                                    <p className="text-sm font-bold text-white">{user?.role || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Status</p>
                                    <p className="text-sm font-bold text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-[#222] p-6 rounded-sm hover:border-[#333] transition-colors relative group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#333] to-transparent group-hover:via-accent-500/50 transition-all"></div>
                            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#666] mb-4 flex items-center gap-2">
                                <Settings size={14} className="text-accent-500" /> System Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Last Login</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <Calendar size={12} className="text-[#888]" /> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Region</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <MapPin size={12} className="text-[#888]" /> Global Server
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-1">Registered ID</p>
                                    <p className="text-sm font-bold text-white font-mono break-all">{user?.id || 'sys-auth-usr-xxx'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#222] text-center">
                        <p className="text-xs font-mono text-[#555] uppercase tracking-widest">
                            Additional profile settings and history will be available in future system updates.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StaticProfile;
