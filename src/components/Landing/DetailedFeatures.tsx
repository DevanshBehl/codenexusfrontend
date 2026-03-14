import { Terminal, Video, PenTool, BrainCircuit, Code2, LineChart, ShieldCheck, Zap } from 'lucide-react';

export default function DetailedFeatures() {
    const features = [
        {
            icon: <Code2 size={24} className="text-accent-500" />,
            title: "LeetCode-Style Practice Hub",
            description: "Access 1000+ curated DSA problems categorized by difficulty and pattern. Practice in the exact same IDE environment you'll use for real interviews so you are uniquely prepared."
        },
        {
            icon: <BrainCircuit size={24} className="text-accent-500" />,
            title: "AI Interviewer (Beta)",
            description: "Take on-demand mock interviews with an AI that observes your code, asks follow up optimization questions, and scores your communication skills in real-time."
        },
        {
            icon: <Terminal size={24} className="text-accent-500" />,
            title: "Collaborative IDE environment",
            description: "Lag-free syntax highlighting, auto-completion, and multi-cursor support for over 20+ programming languages. Execute code and see test case results instantly."
        },
        {
            icon: <PenTool size={24} className="text-accent-500" />,
            title: "Infinite Whiteboard Canvas",
            description: "Draw system architecture diagrams or trace complex data structures visually using our built-in whiteboard. Perfect for senior backend or full-stack interviews."
        },
        {
            icon: <Video size={24} className="text-accent-500" />,
            title: "Integrated Video Conferencing",
            description: "No more juggling Zoom links and separate code editors. Enjoy crystal clear 1-on-1 WebRTC video calling embedded directly next to the code editor."
        },
        {
            icon: <LineChart size={24} className="text-accent-500" />,
            title: "University & HR Dashboards",
            description: "Manage candidate pipelines, schedule interviews across timezone, and review highly detailed candidate scorecards and session recordings."
        },
        {
            icon: <Zap size={24} className="text-accent-500" />,
            title: "Instant Session Playback",
            description: "Interviews are recorded as keystroke/video logs. Hiring committees can replay the exact problem-solving timeline rather than relying on brief interviewer notes."
        },
        {
            icon: <ShieldCheck size={24} className="text-accent-500" />,
            title: "Anti-Plagiarism & Proctoring",
            description: "Ensure candidate integrity with built-in tab-tracking, copy-paste detection, and AI similarity scores across all completed interview sessions."
        }
    ];

    return (
        <section className="py-24 px-6 border-b border-[#333] bg-[#050505]">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white uppercase font-sans tracking-tight mb-4 border-l-4 border-accent-500 pl-4">COMPREHENSIVE TOOLSET</h2>
                    <p className="text-[#888] font-mono text-sm max-w-2xl leading-relaxed pl-5">
                        Everything you need to practice, execute, and analyze technical interviews.
                        CodeNexus replaces 4 disjointed tools with one streamlined platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-[#0A0A0A] border border-[#222] p-6 rounded-sm hover:border-accent-500/50 hover:bg-[#111] transition-all group">
                            <div className="mb-4 bg-[#111] w-12 h-12 flex items-center justify-center rounded-sm border border-[#333] group-hover:scale-110 transition-transform shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.0)] group-hover:shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.2)]">
                                {feature.icon}
                            </div>
                            <h3 className="text-white font-bold mb-3 font-sans text-sm tracking-wide">{feature.title}</h3>
                            <p className="text-[#888] font-mono text-xs leading-relaxed group-hover:text-[#aaa] transition-colors">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
