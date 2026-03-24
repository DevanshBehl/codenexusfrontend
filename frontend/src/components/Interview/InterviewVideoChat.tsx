import { useState } from 'react';
import { Video, VideoOff, Mic, MicOff, MessageSquare, Send, Maximize2 } from 'lucide-react';

export default function InterviewVideoChat() {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    return (
        <section className="col-span-1 flex flex-col gap-4 min-h-0">
            {/* Video Grid */}
            <div className="flex-1 grid grid-rows-2 gap-4 min-h-0">
                {/* Interviewer Video */}
                <div className="relative border border-[#333] bg-[#0A0A0A] rounded-sm overflow-hidden group hover:border-[#444] transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-600 to-[#6b21a8] flex items-center justify-center text-xl font-bold shadow-xl">
                            IN
                        </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm text-xs font-medium flex items-center gap-2 border border-[#333]">
                        Interviewer
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-sm bg-black/60 backdrop-blur-md hover:bg-[#333] text-white border border-[#333]">
                            <Maximize2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Student Video */}
                <div className="relative border border-accent-500/30 bg-[#0A0A0A] rounded-sm overflow-hidden group shadow-[0_0_15px_oklch(0.777_0.152_181.912_/_0.1)_inset]">
                    <div className="absolute inset-0">
                        {/* Fake video noise/bg */}
                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#111]">
                            <div className="w-20 h-20 rounded-full border border-[#333] flex items-center justify-center bg-[#050505]">
                                <Video size={32} className="text-[#333]" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm text-xs font-medium flex items-center gap-2 border border-[#333] text-accent-400">
                        Student (You)
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-2 rounded-full border transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' : 'bg-[#111] text-white border-[#333] hover:bg-[#222]'}`}
                        >
                            {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                        </button>
                        <button
                            onClick={() => setIsVideoOff(!isVideoOff)}
                            className={`p-2 rounded-full border transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30' : 'bg-[#111] text-white border-[#333] hover:bg-[#222]'}`}
                        >
                            {isVideoOff ? <VideoOff size={14} /> : <Video size={14} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="h-1/3 border border-[#333] bg-[#0A0A0A] rounded-sm flex flex-col overflow-hidden group hover:border-[#444] transition-colors">
                <div className="h-10 border-b border-[#333] flex items-center gap-2 px-4 bg-[#111]">
                    <MessageSquare size={14} className="text-accent-400" />
                    <h2 className="text-sm font-semibold text-[#aaa] font-sans">Meeting Chat</h2>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-[#666] font-mono">Interviewer • 10:02 AM</span>
                        <div className="bg-[#111] rounded-sm rounded-tl-none p-3 text-xs text-[#aaa] border border-[#222] inline-block self-start shadow-sm font-sans">
                            Hello! Welcome to the interview. Let's start with the Two Sum problem.
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] text-accent-500 font-mono">You • 10:03 AM</span>
                        <div className="bg-accent-500/10 rounded-sm rounded-tr-none p-3 text-xs text-white border border-accent-500/30 inline-block self-end shadow-sm font-sans">
                            Hi, thank you! I'll read through the description now.
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-[#333] bg-[#050505]">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full bg-[#111] border border-[#333] rounded-sm py-2 pl-3 pr-10 text-xs text-white placeholder-[#555] focus:outline-none focus:border-accent-500/50 transition-colors bg-transparent selection:bg-accent-500/30"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-sm text-[#555] hover:text-accent-400 hover:bg-[#222] transition-colors">
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
