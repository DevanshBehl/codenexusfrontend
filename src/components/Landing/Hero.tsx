import { ChevronRight, Terminal, Video, PenTool, Users } from 'lucide-react';

export default function Hero() {
    return (
        <section className="py-24 px-6 border-b border-[#333] flex flex-col items-center justify-center text-center relative min-h-[90vh]">
            <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-1 text-xs text-[#aaa] rounded-sm mb-8 hover:bg-[#222] cursor-pointer transition-colors font-mono tracking-wide">
                <span className="bg-[#787878] text-white px-1.5 py-0.5 rounded-sm font-bold text-[10px]">NEW</span>
                <span>Real-time AI Mock Interviews</span>
                <ChevronRight size={14} />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white max-w-5xl uppercase tracking-tight leading-[1.1] mb-6 font-sans">
                THE ALL-IN-ONE PLATFORM FOR <br /> PLACEMENT PREP & TECHNICAL HIRING
            </h1>

            <p className="text-[#888] max-w-3xl mx-auto text-sm md:text-base leading-relaxed mb-10 font-mono text-center">
                Practice LeetCode-style DSA problems, take real-time AI mock interviews, and connect with universities and recruiters. Say goodbye to uncoordinated screen sharing with our lag-free collaborative IDE, 1-on-1 video conferencing, and built-in interactive whiteboards.
            </p>

            <div className="flex items-center gap-4 mb-20">
                <button className="bg-[#e0e0e0] text-black px-6 py-3 font-bold hover:bg-white transition-colors text-sm font-mono">
                    Start Practicing
                </button>
                <button className="border border-[#555] bg-transparent text-white px-6 py-3 font-bold hover:bg-[#111] transition-colors text-sm flex items-center gap-2 font-mono">
                    Schedule Interview
                </button>
            </div>

            <div className="w-full max-w-5xl border border-[#333] bg-[#0a0a0a] rounded-sm p-4 relative shadow-2xl">
                {/* Render some mock UI here in DevDoq style with the new cyan theme */}
                <div className="border border-[#333] rounded-sm overflow-hidden flex flex-col h-[450px]">
                    {/* Tab header */}
                    <div className="flex bg-[#111] border-b border-[#333]">
                        <div className="px-4 py-2 border-r border-[#333] text-xs text-accent-400 border-b-2 border-accent-500 font-mono flex items-center gap-2"><Terminal size={12} /> ide.ts</div>
                        <div className="px-4 py-2 border-r border-[#333] text-xs text-[#666] font-mono flex items-center gap-2"><PenTool size={12} /> whiteboard</div>
                        <div className="px-4 py-2 border-r border-[#333] text-xs text-[#666] font-mono flex items-center gap-2"><Video size={12} /> video call</div>
                        <div className="px-4 py-2 border-r border-[#333] text-xs text-[#666] font-mono">chat</div>
                    </div>

                    <div className="flex flex-1">
                        <div className="w-[60%] p-6 border-r border-[#333] flex flex-col text-left font-mono relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-white font-bold text-xs uppercase tracking-widest text-[#aaa]">LIVE INTERVIEW SESSION</h3>
                                </div>
                                <div className="flex gap-2 text-xs text-[#666]">
                                    <span className="text-red-500 animate-pulse flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> REC 00:14:32</span>
                                </div>
                            </div>

                            {/* IDE Content */}
                            <div className="flex-1 overflow-hidden relative border border-[#222] bg-[#050505] p-4 text-xs">
                                <span className="text-[#555]">1 | <span className="text-accent-400">function</span> <span className="text-blue-300">maxSlidingWindow</span>(nums, k) {'{\n'}</span>
                                <span className="text-[#555]">2 |   <span className="text-[#888]">// Interviewer added a hint here: Use a deque</span>{'\n'}</span>
                                <span className="text-[#555]">3 |   const result = [];{'\n'}</span>
                                <span className="text-[#555]">4 |   const deque = [];{'\n'}</span>
                                <span className="text-[#555]">5 |   <span className="text-accent-400">for</span> (let i = 0; i {'<'} nums.length; i++) {'{\n'}</span>
                                <span className="text-[#555]">6 |     <span className="text-accent-400">while</span> (deque.length {'>'} 0 {'&&'} deque[0] {'<='} i - k) {'{\n'}</span>
                                <span className="text-[#555]">7 |       deque.<span className="text-blue-300">shift</span>();{'\n'}</span>
                                <span className="text-[#555]">8 |     {'}\n'}</span>
                                <span className="text-[#555]">9 |     <span className="text-accent-400">while</span> (deque.length {'>'} 0 {'&&'} nums[deque[deque.length - 1]] {'<'} nums[i]) {'{\n'}</span>
                                <span className="text-[#555]">10|       deque.<span className="text-blue-300">pop</span>();{'\n'}</span>
                                <span className="text-[#555]">11|     {'}\n'}</span>
                                <span className="text-[#555]">12|     deque.<span className="text-blue-300">push</span>(i);{'\n'}</span>
                                <span className="text-[#555]">13| <span className="inline-block w-1.5 h-3 bg-accent-400 animate-pulse"></span></span>

                                {/* Cursor Indicator */}
                                <div className="absolute left-[36%] top-[65%] glass-card bg-accent-500/20 border border-accent-500/50 px-2 py-0.5 rounded-sm text-[9px] text-accent-400">Student is typing...</div>
                            </div>
                        </div>

                        {/* Right panel: Video & Architecture/Reports */}
                        <div className="w-[40%] bg-[#050505] p-4 flex flex-col relative overflow-hidden group border-t border-l border-[#222]">
                            <div className="text-xs text-[#888] flex justify-between items-center mb-4 relative z-10 font-mono">
                                <h3 className="flex items-center gap-2"><ChevronRight size={14} className="text-accent-500" /> Multi-Tool Panel</h3>
                                <div className="flex gap-2">
                                    <span className="px-2 border border-[#333] bg-[#222] text-white rounded-[2px] border-b-2 border-b-accent-500">Video</span>
                                    <span className="px-2 border border-[#333] bg-[#111] rounded-[2px]">Diagram</span>
                                </div>
                            </div>

                            {/* Video Feed Mocks */}
                            <div className="flex-1 flex flex-col gap-3">
                                {/* Interviewer Video */}
                                <div className="flex-1 bg-[#111] border border-[#333] relative rounded-sm flex items-center justify-center group-hover:border-[#444] transition-colors">
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] uppercase tracking-widest font-mono text-white">HR / Interviewer</div>
                                    <Users size={24} className="text-[#333]" />
                                </div>
                                {/* Student Video */}
                                <div className="flex-1 bg-[#111] border border-accent-500/50 shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.15)] relative rounded-sm flex items-center justify-center">
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] uppercase tracking-widest font-mono text-accent-400">Student (You)</div>
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        <span className="w-1 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                        <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-1 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                                    </div>
                                    <Users size={24} className="text-[#444]" />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
