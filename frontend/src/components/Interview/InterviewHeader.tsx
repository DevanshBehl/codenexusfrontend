export default function InterviewHeader() {
    return (
        <header className="h-14 border-b border-[#333] flex items-center justify-between px-6 bg-[#050505]/90 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-accent-500/20 border border-accent-500/50 flex items-center justify-center">
                    <span className="text-accent-400 font-bold font-mono">CN</span>
                </div>
                <span className="font-semibold text-white/90">Interview Room</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-mono text-[#888]">
                <span>01:45:22 remaining</span>
                <button className="px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                    End Interview
                </button>
            </div>
        </header>
    );
}
