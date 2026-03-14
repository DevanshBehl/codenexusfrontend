import React, { useState } from 'react';
import {
    Terminal,
    Play,
    Send,
    Video,
    VideoOff,
    Mic,
    MicOff,
    MessageSquare,
    Settings,
    Maximize2
} from 'lucide-react';

const Interview = () => {
    const [language, setLanguage] = useState('cpp');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
            {/* Navbar Minimal */}
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

            {/* Main 3-Column Layout */}
            <main className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 min-h-0 z-10">

                {/* COLUMN 1: Problem & Test Cases */}
                <section className="col-span-1 flex flex-col gap-4 min-h-0">
                    {/* Question Area */}
                    <div className="flex-1 border border-[#333] bg-[#0A0A0A] rounded-sm overflow-hidden flex flex-col group hover:border-[#444] transition-colors">
                        <div className="h-10 border-b border-[#333] flex items-center px-4 bg-[#111]">
                            <h2 className="text-sm font-semibold text-[#aaa] font-sans">Problem Description</h2>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            <h1 className="text-xl font-bold mb-2 text-white">Two Sum</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-0.5 rounded-sm text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Easy</span>
                            </div>
                            <div className="text-[#888] text-sm space-y-4 font-mono leading-relaxed">
                                <p>Given an array of integers <code className="text-accent-400">nums</code> and an integer <code className="text-accent-400">target</code>, return indices of the two numbers such that they add up to <code className="text-accent-400">target</code>.</p>
                                <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                                <p>You can return the answer in any order.</p>

                                <div className="mt-6 border border-[#333] rounded-sm p-3 bg-[#111] font-mono text-xs">
                                    <p className="font-semibold text-white/90 mb-1">Example 1:</p>
                                    <p><span className="text-[#555]">Input:</span> nums = [2,7,11,15], target = 9</p>
                                    <p><span className="text-[#555]">Output:</span> [0,1]</p>
                                    <p><span className="text-[#555]">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testcases Area */}
                    <div className="h-1/3 border border-[#333] bg-[#0A0A0A] rounded-sm overflow-hidden flex flex-col group hover:border-[#444] transition-colors">
                        <div className="h-10 border-b border-[#333] flex items-center justify-between px-4 bg-[#111]">
                            <h2 className="text-sm font-semibold text-[#aaa] font-sans">Test Cases</h2>
                            <div className="flex gap-2">
                                <button className="text-xs text-[#666] hover:text-white transition-colors">Testcase</button>
                                <span className="text-[#333]">|</span>
                                <button className="text-xs text-accent-400 transition-colors">Test Result</button>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="flex gap-2 mb-3">
                                <button className="px-3 py-1 text-xs rounded-sm bg-[#222] text-white border-b-2 border-accent-500 font-mono">Case 1</button>
                                <button className="px-3 py-1 text-xs rounded-sm text-[#666] hover:bg-[#111] hover:text-white font-mono transition-colors">Case 2</button>
                                <button className="px-3 py-1 text-xs rounded-sm text-[#666] hover:bg-[#111] hover:text-white font-mono transition-colors">Case 3</button>
                            </div>
                            <div className="space-y-3 font-mono text-sm">
                                <div>
                                    <div className="text-[#555] text-xs mb-1">nums =</div>
                                    <div className="bg-[#111] border border-[#222] rounded-sm px-3 py-2 text-white/90">[2,7,11,15]</div>
                                </div>
                                <div>
                                    <div className="text-[#555] text-xs mb-1">target =</div>
                                    <div className="bg-[#111] border border-[#222] rounded-sm px-3 py-2 text-white/90">9</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COLUMN 2: Code Editor */}
                <section className="col-span-2 border border-accent-500/30 bg-[#050505] rounded-sm overflow-hidden flex flex-col relative group hover:border-accent-500/60 transition-colors shadow-[0_0_20px_oklch(0.777_0.152_181.912_/_0.05)]">
                    {/* Editor Header */}
                    <div className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#111]">
                        <div className="flex items-center gap-3">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-[#222] border border-[#333] text-white text-sm rounded-sm px-3 py-1.5 focus:outline-none focus:border-accent-500/50 appearance-none font-mono cursor-pointer"
                            >
                                <option value="cpp">C++</option>
                                <option value="java">Java</option>
                                <option value="python">Python 3</option>
                                <option value="javascript">JavaScript</option>
                            </select>
                            <button className="p-1.5 rounded-sm hover:bg-[#222] text-[#666] hover:text-white transition-colors border border-transparent hover:border-[#333]">
                                <Settings size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-1.5 bg-[#222] hover:bg-[#333] border border-[#333] rounded-sm text-sm font-medium transition-all text-white/90">
                                <Play size={14} className="text-green-400" />
                                Run
                            </button>
                            <button className="flex items-center gap-2 px-4 py-1.5 bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/50 rounded-sm text-sm font-semibold transition-all text-accent-400">
                                <Send size={14} />
                                Submit
                            </button>
                        </div>
                    </div>

                    {/* Editor Area (Mockup) */}
                    <div className="flex-1 relative font-mono text-sm leading-relaxed flex overflow-hidden">
                        {/* Line numbers */}
                        <div className="w-12 border-r border-[#222] bg-[#0A0A0A] pt-4 flex flex-col items-end pr-3 text-[#555] select-none">
                            {[...Array(20)].map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        {/* Code Textarea (Mock) */}
                        <textarea
                            className="flex-1 bg-transparent p-4 text-white/90 resize-none focus:outline-none custom-scrollbar whitespace-pre"
                            defaultValue={`class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> numMap;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (numMap.count(complement)) {\n                return {numMap[complement], i};\n            }\n            numMap[nums[i]] = i;\n        }\n        return {};\n    }\n};`}
                            spellCheck="false"
                        />

                        {/* Floating watermark/logo */}
                        <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
                            <Terminal size={120} />
                        </div>
                        {/* Caret Mock */}
                        <div className="absolute top-[31%] left-[32%] w-0.5 h-4 bg-accent-400 animate-pulse"></div>
                    </div>
                </section>

                {/* COLUMN 3: Video & Chat */}
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

            </main>

            {/* Global styles for custom scrollbar in this layout */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #050505;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}} />
        </div>
    );
};

export default Interview;
