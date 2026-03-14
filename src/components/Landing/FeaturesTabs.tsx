import { ChevronRight, BrainCircuit } from 'lucide-react';

export default function FeaturesTabs() {
    return (
        <section className="py-24 px-6 border-b border-[#333] flex flex-col bg-[#050505]" id="prep">
            <div className="flex gap-4 mb-10 text-sm max-w-6xl mx-auto w-full">
                <div className="border border-[#333] px-4 py-2 bg-[#111] text-white cursor-pointer font-sans font-medium text-xs rounded-[2px] shadow-[0_2px_0_oklch(0.777_0.152_181.912)]">For Students (Prep & AI Mocks)</div>
                <div className="border border-transparent px-4 py-2 text-[#666] cursor-pointer hover:text-white font-sans font-medium text-xs">For Recruiters (Live Interviews)</div>
            </div>

            <div className="flex flex-col md:flex-row gap-16 items-center max-w-6xl mx-auto w-full">
                <div className="w-full md:w-1/2">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase font-sans tracking-[0.02em]">MASTER THE INTERVIEW PROCESS</h2>
                    <p className="text-[#888] text-sm md:text-[15px] leading-[1.8] mb-8 font-mono">
                        Don't wait for your dream company to test your skills. With CodeNexus, students can practice a massive library of LeetCode-style DSA problems in the exact same IDE they will be interviewed in.
                        <br /><br />
                        Switch to <strong>Real-Time AI Mock Interviews</strong>, where an AI evaluator acts as your interviewer—testing your logic, code efficiency, and giving instant, actionable feedback to help you improve before the real thing.
                    </p>
                    <button className="bg-white text-black font-bold px-4 py-2 flex items-center gap-2 hover:bg-[#e0e0e0] transition-colors text-xs font-mono rounded-[2px]">
                        Try an AI Mock <ChevronRight size={14} />
                    </button>
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                    {/* Abstract node graph representing AI/DSA prep */}
                    <div className="relative w-[300px] h-[300px] hover:scale-105 transition-transform duration-700 flex items-center justify-center">
                        <BrainCircuit size={160} strokeWidth={1} className="text-accent-500 drop-shadow-[0_0_20px_oklch(0.777_0.152_181.912_/_0.3)]" />

                        <div className="absolute inset-0">
                            <div className="absolute top-10 left-10 w-3 h-3 bg-white rounded-full animate-ping"></div>
                            <div className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute top-1/2 right-4 w-4 h-4 bg-accent-400 rounded-full drop-shadow-[0_0_10px_oklch(0.777_0.152_181.912)] animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
