import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Github, Linkedin, ArrowRight, ArrowLeft, Server, Database, Code2, Layout, Shield, Cpu,
    Layers, Globe, Monitor, Terminal, Users, Building2, GraduationCap, Video, Mail,
    Presentation, Swords, ChevronRight, Zap, GitBranch, Box
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.08 }
    })
};

const stagger = {
    visible: { transition: { staggerChildren: 0.08 } }
};

export default function AboutDeveloper() {
    const techStack = [
        { name: 'React 19', color: '#61DAFB' },
        { name: 'TypeScript', color: '#3178C6' },
        { name: 'Tailwind v4', color: '#06B6D4' },
        { name: 'Vite 8', color: '#FFDA2D' },
        { name: 'Framer Motion', color: '#0055FF' },
        { name: 'Lucide Icons', color: '#F56565' },
        { name: 'React Router v7', color: '#CA4245' },
        { name: 'WebRTC', color: '#4DC71F' },
    ];

    const architectureCards = [
        { icon: Layout, title: 'Component Architecture', desc: 'Atomic design with reusable components. Role-based dashboards share a unified sidebar pattern, ensuring visual consistency across all 4 portals.' },
        { icon: Server, title: 'Service Layer Design', desc: 'Decoupled microservices for Auth, Code Execution (sandboxed Piston API), Mail Delivery, WebRTC Signaling, and Contest Management.' },
        { icon: Code2, title: 'Live Interview IDE', desc: 'Three-column workspace with synchronized code editing, real-time test-case execution, and embedded HD video conferencing — zero third-party apps.' },
        { icon: Database, title: 'Data Modeling', desc: 'Relational schema for hierarchical entities (University → Drives → Students → Submissions) with Redis-backed session and leaderboard caching.' },
        { icon: Shield, title: 'RBAC Access Control', desc: 'Strict role-based gating isolates Student, University, Company, and Recruiter contexts. The internal mail system enforces directional communication rules.' },
        { icon: Cpu, title: 'WebRTC Media Engine', desc: 'Peer-to-peer mesh for low-latency video interviews and webinar broadcasting with host-controlled mic/camera permissions and raise-hand signaling.' },
    ];

    const routeGroups = [
        {
            role: 'Student',
            icon: GraduationCap,
            color: '#06B6D4',
            routes: [
                { path: '/student/dashboard', label: 'Command Center', desc: 'Analytics, progress tracking, placement drive status' },
                { path: '/student/codearena', label: 'Code Arena', desc: 'Competitive programming with leaderboards' },
                { path: '/student/codearena/:id', label: 'Problem Solver', desc: 'Full IDE with execution and test cases' },
                { path: '/student/interview', label: 'Interview Room', desc: 'Live technical interview workspace' },
                { path: '/student/webinars', label: 'Webinar List', desc: 'Browse and join company PPTs' },
                { path: '/student/mail', label: 'Internal Mail', desc: 'Message university & support' },
            ]
        },
        {
            role: 'University',
            icon: Building2,
            color: '#8B5CF6',
            routes: [
                { path: '/university/dashboard', label: 'Placement Cell', desc: 'Manage drives, students, and companies' },
                { path: '/university/evaluation', label: 'Evaluations', desc: 'Assess student performance reports' },
                { path: '/university/webinars', label: 'Webinar List', desc: 'Monitor company PPT schedules' },
                { path: '/university/mail', label: 'Internal Mail', desc: 'Contact students, companies & support' },
            ]
        },
        {
            role: 'Company',
            icon: Swords,
            color: '#F59E0B',
            routes: [
                { path: '/company/dashboard', label: 'Recruiter Hub', desc: 'University partnerships & pipelines' },
                { path: '/company/create-contest', label: 'Contest Builder', desc: 'Custom coding assessments' },
                { path: '/company/ppt', label: 'Schedule PPT', desc: 'Pre-placement webinar scheduling' },
                { path: '/company/evaluation', label: 'Evaluate Candidates', desc: 'Review recordings & make decisions' },
                { path: '/company/webinar', label: 'Host Webinar', desc: 'Live PPT with full host controls' },
                { path: '/company/mail', label: 'Internal Mail', desc: 'Message all stakeholders' },
            ]
        },
        {
            role: 'Recruiter',
            icon: Video,
            color: '#EF4444',
            routes: [
                { path: '/recruiter/dashboard', label: 'Interview Hub', desc: 'Schedule, recordings & verdicts' },
                { path: '/recruiter/interview', label: 'Conduct Interview', desc: 'Live 3-column IDE workspace' },
                { path: '/recruiter/mail', label: 'Internal Mail', desc: 'Contact companies directly' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-x-hidden">

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>
            <div className="fixed inset-y-0 left-[5%] xl:left-[10%] w-[1px] bg-[#222] z-0 hidden lg:block opacity-50"></div>
            <div className="fixed inset-y-0 right-[5%] xl:right-[10%] w-[1px] bg-[#222] z-0 hidden lg:block opacity-50"></div>

            <div className="relative z-10 w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto border-x-0 lg:border-x border-[#222] min-h-screen flex flex-col bg-[#050505]/50 backdrop-blur-[1px]">

                {/* Sticky Nav */}
                <nav className="w-full border-b border-[#333] flex items-center justify-between px-6 py-4 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
                            <span>{'<'}cn/{'>'}</span>
                        </Link>
                        <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
                            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                                <ArrowLeft size={12} /> Back to Home
                            </Link>
                            <span className="text-white border-b-2 border-accent-500 pb-1">About Developer</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-sm font-mono">
                        <Link to="/signup" className="bg-[#e0e0e0] text-black px-4 py-1.5 font-bold hover:bg-white transition-colors">
                            Get Access
                        </Link>
                    </div>
                </nav>

                {/* ── HERO: Developer Profile ── */}
                <motion.section
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                    className="px-6 md:px-16 pt-24 pb-20 relative overflow-hidden"
                >
                    {/* Big glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-1.5 text-[10px] text-[#aaa] rounded-sm mb-8 font-mono tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                        PLATFORM ARCHITECT & DEVELOPER
                    </motion.div>

                    <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-bold font-sans tracking-tight text-white mb-3 uppercase leading-[1.1]">
                        Devansh <span className="text-accent-400 font-serif italic">Behl</span>
                    </motion.h1>

                    <motion.p custom={2} variants={fadeUp} className="text-[#888] font-mono text-xs mb-2 tracking-widest uppercase">
                        Full-Stack Developer & System Designer
                    </motion.p>

                    <motion.div custom={3} variants={fadeUp} className="w-16 h-[2px] bg-accent-500 mb-8"></motion.div>

                    <motion.p custom={4} variants={fadeUp} className="max-w-2xl text-[#aaa] text-sm md:text-base leading-relaxed mb-10">
                        Passionate about building scalable, beautiful, and high-performance web applications. CodeNexus was conceived to replace the fragmented campus placement pipeline with a single, cohesive platform — from coding prep to final evaluation — entirely eliminating external dependencies like Zoom, HackerRank, or email.
                    </motion.p>

                    <motion.div custom={5} variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-16">
                        <a
                            href="https://github.com/DevanshBehl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 bg-white text-black px-6 py-3 rounded-sm font-mono text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            <Github size={16} /> GitHub
                        </a>
                        <a
                            href="https://linkedin.com/in/devanshbehl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2.5 bg-[#111] text-accent-400 border border-accent-500/30 hover:border-accent-500 px-6 py-3 rounded-sm font-mono text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all duration-200"
                        >
                            <Linkedin size={16} /> LinkedIn
                        </a>
                    </motion.div>

                    {/* Tech Pills */}
                    <motion.div custom={6} variants={fadeUp} className="flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                            <span
                                key={tech.name}
                                className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-[#333] bg-[#111] rounded-sm text-[#aaa] hover:text-white hover:border-[#555] transition-colors cursor-default"
                            >
                                <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: tech.color }}></span>
                                {tech.name}
                            </span>
                        ))}
                    </motion.div>
                </motion.section>

                {/* Divider */}
                <div className="mx-6 md:mx-16 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

                {/* ── SYSTEM ARCHITECTURE ── */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={stagger}
                    className="px-6 md:px-16 py-24"
                >
                    <motion.div custom={0} variants={fadeUp} className="mb-16">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center">
                                <Layers size={14} className="text-accent-400" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white">
                                System <span className="text-accent-400 italic font-serif">Architecture</span>
                            </h2>
                        </div>
                        <p className="text-[#666] font-mono text-xs uppercase tracking-widest ml-11">Behind-the-scenes technical design</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {architectureCards.map((card, i) => (
                            <motion.div
                                key={i}
                                custom={i + 1}
                                variants={fadeUp}
                                className="bg-[#0A0A0A] border border-[#1a1a1a] p-7 rounded-sm hover:border-[#333] transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-500/3 rounded-full blur-[40px] group-hover:bg-accent-500/8 transition-all duration-500 pointer-events-none translate-x-8 -translate-y-8"></div>
                                <div className="w-10 h-10 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center mb-5 group-hover:border-accent-500/50 transition-colors">
                                    <card.icon size={18} className="text-[#666] group-hover:text-accent-400 transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-3">{card.title}</h3>
                                <p className="text-[11px] text-[#666] font-mono leading-[1.8]">{card.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Divider */}
                <div className="mx-6 md:mx-16 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

                {/* ── ECOSYSTEM FLOW DIAGRAM ── */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={stagger}
                    className="px-6 md:px-16 py-24"
                >
                    <motion.div custom={0} variants={fadeUp} className="mb-16">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center">
                                <GitBranch size={14} className="text-accent-400" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white">
                                Ecosystem <span className="text-accent-400 italic font-serif">Flow</span>
                            </h2>
                        </div>
                        <p className="text-[#666] font-mono text-xs uppercase tracking-widest ml-11">How the four portals interconnect</p>
                    </motion.div>

                    <motion.div custom={1} variants={fadeUp} className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-sm p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/3 via-transparent to-transparent pointer-events-none"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
                            {/* Left column */}
                            <div className="flex flex-col gap-5">
                                <div className="border border-[#333] bg-[#111] p-5 rounded-sm hover:border-accent-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <GraduationCap size={14} className="text-cyan-400" />
                                        <h4 className="font-bold text-white text-sm tracking-wider uppercase">Students</h4>
                                    </div>
                                    <p className="text-[10px] font-mono text-[#666] leading-relaxed">CodeArena practice, Interview Room access, Webinar participation, Mail to university</p>
                                </div>
                                <div className="border border-[#333] bg-[#111] p-5 rounded-sm hover:border-accent-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={14} className="text-violet-400" />
                                        <h4 className="font-bold text-white text-sm tracking-wider uppercase">Universities</h4>
                                    </div>
                                    <p className="text-[10px] font-mono text-[#666] leading-relaxed">Placement drive management, Student evaluations, Webinar oversight, Mail to all</p>
                                </div>
                            </div>

                            {/* Center hub */}
                            <div className="flex items-center justify-center py-4">
                                <div className="relative">
                                    <div className="w-36 h-36 rounded-full border-2 border-accent-500/20 bg-[#0A0A0A] flex items-center justify-center shadow-[0_0_80px_rgba(6,182,212,0.08)]">
                                        <div className="absolute inset-2 rounded-full border border-dashed border-accent-500/10 animate-[spin_20s_linear_infinite]"></div>
                                        <div className="flex flex-col items-center gap-1 relative z-10">
                                            <span className="font-bold text-2xl text-accent-400 font-serif italic">{'<'}cn/{'>'}</span>
                                            <span className="text-[8px] font-mono text-[#888] uppercase tracking-[0.2em]">CodeNexus Core</span>
                                        </div>
                                    </div>

                                    {/* Connector dots */}
                                    <div className="hidden md:block absolute top-1/2 -left-10 -translate-y-1/2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1 h-1 rounded-full bg-accent-500/60"></div>
                                            <div className="w-6 h-[1px] bg-accent-500/30"></div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-500/80"></div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block absolute top-1/2 -right-10 -translate-y-1/2">
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-500/80"></div>
                                            <div className="w-6 h-[1px] bg-accent-500/30"></div>
                                            <div className="w-1 h-1 rounded-full bg-accent-500/60"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right column */}
                            <div className="flex flex-col gap-5">
                                <div className="border border-[#333] bg-[#111] p-5 rounded-sm hover:border-accent-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Swords size={14} className="text-amber-400" />
                                        <h4 className="font-bold text-white text-sm tracking-wider uppercase">Companies</h4>
                                    </div>
                                    <p className="text-[10px] font-mono text-[#666] leading-relaxed">Contest creation, PPT scheduling, Webinar hosting, Candidate evaluation, Mail to all</p>
                                </div>
                                <div className="border border-[#333] bg-[#111] p-5 rounded-sm hover:border-accent-500/30 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Video size={14} className="text-red-400" />
                                        <h4 className="font-bold text-white text-sm tracking-wider uppercase">Recruiters</h4>
                                    </div>
                                    <p className="text-[10px] font-mono text-[#666] leading-relaxed">Live interview IDE, Recording review, Verdict decisions, Mail to companies</p>
                                </div>
                            </div>
                        </div>

                        {/* Shared services strip */}
                        <div className="mt-10 pt-8 border-t border-[#222] flex flex-wrap items-center justify-center gap-4">
                            {[
                                { icon: Mail, label: 'Internal Mail' },
                                { icon: Presentation, label: 'Webinars' },
                                { icon: Terminal, label: 'Code Execution' },
                                { icon: Monitor, label: 'Interview IDE' },
                                { icon: Users, label: 'RBAC Engine' },
                            ].map((svc, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#222] rounded-sm text-[10px] font-mono text-[#888] uppercase tracking-widest hover:border-[#444] hover:text-white transition-colors">
                                    <svc.icon size={12} className="text-accent-500" /> {svc.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.section>

                {/* Divider */}
                <div className="mx-6 md:mx-16 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

                {/* ── ROUTE MAP ── */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={stagger}
                    className="px-6 md:px-16 py-24"
                >
                    <motion.div custom={0} variants={fadeUp} className="mb-16">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center">
                                <Globe size={14} className="text-accent-400" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white">
                                Route <span className="text-accent-400 italic font-serif">Map</span>
                            </h2>
                        </div>
                        <p className="text-[#666] font-mono text-xs uppercase tracking-widest ml-11">Every endpoint and its purpose</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {routeGroups.map((group, gi) => (
                            <motion.div
                                key={gi}
                                custom={gi + 1}
                                variants={fadeUp}
                                className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-sm overflow-hidden hover:border-[#333] transition-colors"
                            >
                                <div className="p-5 border-b border-[#1a1a1a] flex items-center gap-3 bg-[#111]/50">
                                    <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ backgroundColor: group.color + '15', border: `1px solid ${group.color}30` }}>
                                        <group.icon size={14} style={{ color: group.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white">{group.role} Portal</h3>
                                        <p className="text-[10px] font-mono text-[#666]">{group.routes.length} endpoints</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-[#111]">
                                    {group.routes.map((route, ri) => (
                                        <div key={ri} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#111]/50 transition-colors group/route">
                                            <ChevronRight size={10} className="text-[#333] group-hover/route:text-accent-500 transition-colors shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-0.5">
                                                    <code className="text-[10px] font-mono text-accent-400/80 bg-[#111] px-2 py-0.5 rounded-sm border border-[#222]">{route.path}</code>
                                                </div>
                                                <p className="text-[11px] text-[#666] font-mono truncate">{route.label} — {route.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Divider */}
                <div className="mx-6 md:mx-16 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

                {/* ── COMMUNICATION MATRIX ── */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={stagger}
                    className="px-6 md:px-16 py-24"
                >
                    <motion.div custom={0} variants={fadeUp} className="mb-16">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center">
                                <Mail size={14} className="text-accent-400" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white">
                                Communication <span className="text-accent-400 italic font-serif">Matrix</span>
                            </h2>
                        </div>
                        <p className="text-[#666] font-mono text-xs uppercase tracking-widest ml-11">Internal mail permission rules — no external email needed</p>
                    </motion.div>

                    <motion.div custom={1} variants={fadeUp} className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[500px]">
                            <thead>
                                <tr>
                                    <th className="p-4 text-left text-[10px] font-mono text-[#888] uppercase tracking-widest border-b border-[#222] bg-[#0A0A0A]">From ↓ / To →</th>
                                    {['Student', 'University', 'Company', 'Recruiter', 'CN Support'].map(h => (
                                        <th key={h} className="p-4 text-center text-[10px] font-mono text-[#888] uppercase tracking-widest border-b border-[#222] bg-[#0A0A0A]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { from: 'Student', perms: [false, true, false, false, true] },
                                    { from: 'University', perms: [true, false, true, false, true] },
                                    { from: 'Company', perms: [true, true, false, true, true] },
                                    { from: 'Recruiter', perms: [false, false, true, false, true] },
                                ].map((row, ri) => (
                                    <tr key={ri} className="hover:bg-[#111]/50 transition-colors">
                                        <td className="p-4 text-xs font-mono font-bold text-white border-b border-[#111]">{row.from}</td>
                                        {row.perms.map((allowed, ci) => (
                                            <td key={ci} className="p-4 text-center border-b border-[#111]">
                                                <span className={`inline-block w-6 h-6 rounded-sm text-[10px] font-bold flex items-center justify-center mx-auto ${allowed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/5 text-red-400/40 border border-[#222]'}`}>
                                                    {allowed ? '✓' : '✕'}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </motion.section>

                {/* Divider */}
                <div className="mx-6 md:mx-16 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent"></div>

                {/* ── VISION ── */}
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={stagger}
                    className="px-6 md:px-16 py-24"
                >
                    <motion.div custom={0} variants={fadeUp} className="mb-16">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#333] flex items-center justify-center">
                                <Zap size={14} className="text-accent-400" />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight text-white">
                                Vision & <span className="text-accent-400 italic font-serif">Motivation</span>
                            </h2>
                        </div>
                    </motion.div>

                    <motion.div custom={1} variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#0A0A0A] border border-[#1a1a1a] rounded-sm p-8">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                                <Box size={14} className="text-accent-400" /> The Problem
                            </h3>
                            <div className="space-y-4 text-[#aaa] text-sm leading-relaxed">
                                <p>
                                    The traditional campus placement process is fragmented across multiple disconnected tools. Universities use Google Forms for data collection, companies use HackerRank for initial filtering, Zoom for interviews, and spreadsheets for final evaluations.
                                </p>
                                <p>
                                    This leads to <strong className="text-white">data silos</strong>, communication delays, poor candidate experience, and a lack of unified analytics.
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#1a1a1a] rounded-sm p-8">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                                <ArrowRight size={14} className="text-accent-400" /> The Solution
                            </h3>
                            <div className="space-y-4 text-[#aaa] text-sm leading-relaxed">
                                <p>
                                    CodeNexus centralizes <strong className="text-white">every touchpoint</strong> — from coding practice to final evaluation — into a single, role-aware platform with built-in video, code execution, and internal messaging.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Footer */}
                <section className="px-6 md:px-16 py-16 border-t border-[#222]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col items-start">
                            <span className="text-xl font-bold text-white mb-2 font-mono">codenexus</span>
                            <span className="text-[10px] text-accent-500 tracking-widest uppercase font-mono">© 2026 CodeNexus — All Rights Reserved</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-[#666] font-mono tracking-widest uppercase">Developed by</span>
                            <span className="text-sm font-bold text-white tracking-wider">Devansh Behl</span>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
