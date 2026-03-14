import { useState } from 'react';
import { Terminal, Play, Send, Settings } from 'lucide-react';

export default function InterviewEditor() {
    const [language, setLanguage] = useState('cpp');

    return (
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
    );
}
