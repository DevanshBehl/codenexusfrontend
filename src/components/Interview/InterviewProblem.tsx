export default function InterviewProblem() {
    return (
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
    );
}
