import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Terminal, Play, Send, CheckCircle2, Circle, 
    ChevronLeft, Clock, Activity,
    Trophy, Check, X, Code2, AlertCircle, Settings
} from 'lucide-react';

/* ────────── Types & Mock Data ────────── */
interface TestCase {
    input: string;
    output: string;
}

interface Problem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    score: number;
    description: string;
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string[];
    testCases: TestCase[];
    defaultCode: Record<string, string>;
}

const LANGUAGES = [
    { id: 'cpp', name: 'C++' },
    { id: 'java', name: 'Java' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
];

const MOCK_PROBLEMS: Problem[] = [
    {
        id: 'q1',
        title: 'Network Delay Time',
        difficulty: 'Medium',
        score: 100,
        description: "You are given a network of `n` nodes, labeled from `1` to `n`. You are also given `times`, a list of travel times as directed edges `times[i] = (ui, vi, wi)`, where `ui` is the source node, `vi` is the target node, and `wi` is the time it takes for a signal to travel from source to target.\n\nWe will send a signal from a given node `k`. Return the minimum time it takes for all the `n` nodes to receive the signal. If it is impossible for all the `n` nodes to receive the signal, return `-1`.",
        examples: [
            {
                input: 'times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2',
                output: '2',
                explanation: 'Node 2 sends signal to 1 and 3. Node 3 sends to 4. Total time = 1 + 1 = 2.'
            }
        ],
        constraints: [
            '1 <= k <= n <= 100',
            '1 <= times.length <= 6000',
            'times[i].length == 3',
            '1 <= ui, vi <= n',
            'ui != vi',
            '0 <= wi <= 100'
        ],
        testCases: [
            { input: '[[2,1,1],[2,3,1],[3,4,1]]\n4\n2', output: '2' },
            { input: '[[1,2,1]]\n2\n1', output: '1' },
            { input: '[[1,2,1]]\n2\n2', output: '-1' }
        ],
        defaultCode: {
            cpp: "class Solution {\npublic:\n    int networkDelayTime(vector<vector<int>>& times, int n, int k) {\n        \n    }\n};",
            java: "class Solution {\n    public int networkDelayTime(int[][] times, int n, int k) {\n        \n    }\n}",
            python: "class Solution:\n    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:\n        pass",
            javascript: "/**\n * @param {number[][]} times\n * @param {number} n\n * @param {number} k\n * @return {number}\n */\nvar networkDelayTime = function(times, n, k) {\n    \n};"
        }
    },
    {
        id: 'q2',
        title: 'Maximum Subarray',
        difficulty: 'Easy',
        score: 50,
        description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6.' }],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        testCases: [{ input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6' }, { input: '[1]', output: '1' }],
        defaultCode: {
            cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};",
            java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
            python: "class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        pass",
            javascript: "var maxSubArray = function(nums) {\n    \n};"
        }
    },
    {
        id: 'q3',
        title: 'LFU Cache',
        difficulty: 'Hard',
        score: 200,
        description: "Design and implement a data structure for a Least Frequently Used (LFU) cache.",
        examples: [{ input: '["LFUCache", "put", "put", "get"]\n[[2], [1, 1], [2, 2], [1]]', output: '[null, null, null, 1]' }],
        constraints: ['1 <= capacity <= 10^4', '0 <= key <= 10^5', '0 <= value <= 10^9'],
        testCases: [{ input: '["LFUCache", "put", "put", "get"]\n[[2], [1, 1], [2, 2], [1]]', output: '[null, null, null, 1]' }],
        defaultCode: {
            cpp: "class LFUCache {\npublic:\n    LFUCache(int capacity) {\n        \n    }\n};",
            java: "class LFUCache {\n    public LFUCache(int capacity) {\n        \n    }\n}",
            python: "class LFUCache:\n    def __init__(self, capacity: int):\n        pass",
            javascript: "var LFUCache = function(capacity) {\n    \n};"
        }
    },
    {
        id: 'q4',
        title: 'Merge K Sorted Lists',
        difficulty: 'Hard',
        score: 150,
        description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
        examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
        constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500'],
        testCases: [{ input: '[[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
        defaultCode: {
            cpp: "class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};",
            java: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}",
            python: "class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        pass",
            javascript: "var mergeKLists = function(lists) {\n    \n};"
        }
    }
];

interface LeaderboardEntry {
    rank: number;
    username: string;
    score: number;
    time: string;
    q1: 'AC' | 'WA' | '-';
    q2: 'AC' | 'WA' | '-';
    q3: 'AC' | 'WA' | '-';
    q4: 'AC' | 'WA' | '-';
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, username: 'dev_ninja_99', score: 500, time: '1:12:45', q1: 'AC', q2: 'AC', q3: 'AC', q4: 'AC' },
    { rank: 2, username: 'algo_master', score: 350, time: '0:58:20', q1: 'AC', q2: 'AC', q3: '-', q4: 'AC' },
    { rank: 3, username: 'code_wizard', score: 150, time: '0:45:10', q1: 'AC', q2: 'AC', q3: '-', q4: '-' },
    { rank: 4, username: 'byte_me', score: 150, time: '1:02:15', q1: 'AC', q2: 'WA', q3: '-', q4: 'WA' },
    { rank: 5, username: 'KavyaIyer', score: 100, time: '0:30:00', q1: 'AC', q2: '-', q3: '-', q4: '-' },
];


export default function Contest() {
    // Current state
    const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
    const [language, setLanguage] = useState('javascript');
    const [codes, setCodes] = useState<Record<string, Record<string, string>>>({});
    const [solvedStatus, setSolvedStatus] = useState<Record<string, boolean>>({ q2: true }); // Mock some progress
    
    // UI state
    const [activeTab, setActiveTab] = useState<'DESCRIPTION' | 'TESTCASES'>('DESCRIPTION');
    const [activeTestCase, setActiveTestCase] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    
    // Actions output
    const [outputPanel, setOutputPanel] = useState<'HIDDEN' | 'RUN_SUCCESS' | 'RUN_ERROR' | 'SUBMIT_SUCCESS' | 'SUBMIT_ERROR'>('HIDDEN');
    const [isCompiling, setIsCompiling] = useState(false);

    // Timer
    const [timeLeft, setTimeLeft] = useState(2 * 60 * 60); // 2 hours

    const currOp = MOCK_PROBLEMS[currentProblemIdx];
    const currCode = codes[currOp.id]?.[language] ?? currOp.defaultCode[language] ?? '';

    // Initialize codes
    useEffect(() => {
        const initMap: Record<string, Record<string, string>> = {};
        MOCK_PROBLEMS.forEach(p => {
            initMap[p.id] = { ...p.defaultCode };
        });
        setCodes(initMap);
    }, []);

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = (value: string | undefined) => {
        setCodes(prev => ({
            ...prev,
            [currOp.id]: {
                ...prev[currOp.id],
                [language]: value || ''
            }
        }));
    };

    const handleRun = () => {
        setIsCompiling(true);
        setOutputPanel('HIDDEN');
        setTimeout(() => {
            setIsCompiling(false);
            setOutputPanel(Math.random() > 0.3 ? 'RUN_SUCCESS' : 'RUN_ERROR');
        }, 1500);
    };

    const handleSubmit = () => {
        setIsCompiling(true);
        setOutputPanel('HIDDEN');
        setTimeout(() => {
            setIsCompiling(false);
            const success = Math.random() > 0.4;
            setOutputPanel(success ? 'SUBMIT_SUCCESS' : 'SUBMIT_ERROR');
            if (success) {
                setSolvedStatus(prev => ({ ...prev, [currOp.id]: true }));
            }
        }, 2000);
    };

    const getDifficultyColor = (diff: string) => {
        if (diff === 'Easy') return 'text-green-400 border-green-500/30 bg-green-500/10';
        if (diff === 'Medium') return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        return 'text-red-400 border-red-500/30 bg-red-500/10';
    };

    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white flex flex-col overflow-hidden relative selection:bg-accent-500/30 selection:text-white">
            {/* Header */}
            <header className="h-14 border-b border-[#222] bg-[#0A0A0A] shrink-0 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-4">
                    <Link to="/student/dashboard" className="text-[#888] hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="font-serif italic font-bold text-accent-500 text-xl">{'<cn/>'}</span>
                        <div className="w-[1px] h-4 bg-[#333] mx-2"></div>
                        <span className="font-mono text-sm uppercase tracking-widest font-bold">Weekly Contest 142</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-accent-400'}`}>
                        <Clock size={16} />
                        {formatTime(timeLeft)}
                    </div>
                    
                    <button 
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-colors text-xs font-mono uppercase tracking-widest ${showLeaderboard ? 'border-accent-500 text-accent-400 bg-accent-500/10' : 'border-[#333] text-[#aaa] hover:text-white hover:border-[#555]'}`}
                    >
                        <Trophy size={14} /> Leaderboard
                    </button>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Left Sidebar: Question Navigation */}
                <div className="w-16 border-r border-[#222] bg-[#0A0A0A] flex flex-col shrink-0 z-10 py-4 gap-2 items-center overflow-y-auto custom-scrollbar">
                    {MOCK_PROBLEMS.map((p, idx) => {
                        const isSolved = solvedStatus[p.id];
                        const isActive = idx === currentProblemIdx;
                        return (
                            <button
                                key={p.id}
                                onClick={() => { setCurrentProblemIdx(idx); setOutputPanel('HIDDEN'); }}
                                className={`w-12 h-12 rounded-sm border flex flex-col items-center justify-center relative transition-colors group ${isActive ? 'border-accent-500 bg-[#111] text-accent-400' : 'border-[#333] hover:border-[#555] bg-[#0A0A0A] text-[#888] hover:text-white'}`}
                                title={p.title}
                            >
                                <span className="font-mono text-xs font-bold font-sans">Q{idx + 1}</span>
                                {isSolved ? (
                                    <CheckCircle2 size={10} className="text-green-500 absolute bottom-1.5 right-1.5" />
                                ) : (
                                    <Circle size={6} className={`absolute bottom-2 right-2 ${isActive ? 'fill-accent-500 text-accent-500' : 'fill-[#333] text-[#333] group-hover:fill-[#555] group-hover:text-[#555]'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Problem Description Panel */}
                <div className="w-[35%] lg:w-[30%] border-r border-[#222] bg-[#0A0A0A] flex flex-col shrink-0">
                    {/* Tabs */}
                    <div className="flex border-b border-[#222] shrink-0">
                        <button 
                            onClick={() => setActiveTab('DESCRIPTION')}
                            className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'DESCRIPTION' ? 'border-accent-500 text-accent-400 bg-[#111]' : 'border-transparent text-[#666] hover:text-white'}`}
                        >
                            Description
                        </button>
                        <button 
                            onClick={() => setActiveTab('TESTCASES')}
                            className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-widest text-center border-b-2 transition-colors ${activeTab === 'TESTCASES' ? 'border-accent-500 text-accent-400 bg-[#111]' : 'border-transparent text-[#666] hover:text-white'}`}
                        >
                            Test Cases
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        {activeTab === 'DESCRIPTION' && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h1 className="text-xl font-bold font-sans tracking-tight mb-2">{currOp.title}</h1>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm border ${getDifficultyColor(currOp.difficulty)}`}>
                                            {currOp.difficulty}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#888] px-2 py-0.5 border border-[#333] rounded-sm bg-[#111]">
                                            Score: {currOp.score}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-sm font-sans text-[#ccc] leading-relaxed whitespace-pre-wrap">
                                    {currOp.description}
                                </div>

                                {currOp.examples.map((ex, i) => (
                                    <div key={i} className="space-y-2">
                                        <h3 className="text-xs font-bold font-mono text-white">Example {i + 1}:</h3>
                                        <div className="bg-[#111] border border-[#333] rounded-sm p-3 font-mono text-xs text-[#aaa] space-y-1">
                                            <p><span className="text-white">Input:</span> {ex.input}</p>
                                            <p><span className="text-white">Output:</span> {ex.output}</p>
                                            {ex.explanation && <p className="text-[#888] mt-2 italic">Explanation: {ex.explanation}</p>}
                                        </div>
                                    </div>
                                ))}

                                <div>
                                    <h3 className="text-xs font-bold font-mono text-white mb-2">Constraints:</h3>
                                    <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-[#aaa]">
                                        {currOp.constraints.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeTab === 'TESTCASES' && (
                            <div className="space-y-4 animate-fade-in flex flex-col h-full">
                                <div className="flex gap-2 border-b border-[#222] pb-2 overflow-x-auto custom-scrollbar">
                                    {currOp.testCases.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveTestCase(i)}
                                            className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors shrink-0 ${activeTestCase === i ? 'bg-[#222] text-white border border-[#444]' : 'bg-[#111] text-[#888] border border-transparent hover:text-white'}`}
                                        >
                                            Case {i + 1}
                                        </button>
                                    ))}
                                </div>

                                {currOp.testCases[activeTestCase] && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest mb-1 block">Input</label>
                                            <pre className="bg-[#111] border border-[#333] p-3 rounded-sm font-mono text-xs text-[#ccc] whitespace-pre-wrap">
                                                {currOp.testCases[activeTestCase].input}
                                            </pre>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-[#888] uppercase tracking-widest mb-1 block">Expected Output</label>
                                            <pre className="bg-[#111] border border-[#333] p-3 rounded-sm font-mono text-xs text-[#ccc] whitespace-pre-wrap">
                                                {currOp.testCases[activeTestCase].output}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Editor & Output Panel */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
                    
                    {/* Editor Header */}
                    <div className="h-12 border-b border-[#222] bg-[#0A0A0A] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <Code2 size={16} className="text-[#666]" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-[#111] border border-[#333] text-sm text-[#ccc] font-mono rounded-sm px-2 py-1 outline-none focus:border-accent-500 cursor-pointer"
                            >
                                {LANGUAGES.map(l => (
                                    <option key={l.id} value={l.id}>{l.name}</option>
                                ))}
                            </select>
                            <button className="p-1.5 hover:bg-[#111] rounded-sm text-[#666] hover:text-white transition-colors" title="Editor Settings">
                                <Settings size={14} />
                            </button>
                            <button className="mx-2 p-1.5 hover:bg-[#111] rounded-sm text-accent-500 hover:text-accent-400 transition-colors flex items-center gap-1 border border-accent-500/30 font-mono text-[10px] uppercase tracking-widest bg-accent-500/10">
                                <Terminal size={12} /> AI Assist
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleRun}
                                disabled={isCompiling}
                                className="px-4 py-1.5 bg-[#111] border border-[#333] text-white text-[10px] font-mono uppercase tracking-widest rounded-sm hover:border-accent-500 hover:text-accent-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isCompiling ? <Activity size={12} className="animate-spin" /> : <Play size={12} />} Run
                            </button>
                            <button 
                                onClick={handleSubmit}
                                disabled={isCompiling}
                                className="px-6 py-1.5 bg-accent-500 text-white font-bold text-[10px] font-mono uppercase tracking-widest rounded-sm hover:bg-accent-600 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm shadow-accent-500/20"
                            >
                                {isCompiling ? <Activity size={12} className="animate-spin" /> : <Send size={12} />} Submit
                            </button>
                        </div>
                    </div>

                    {/* Editor Space */}
                    <div className="flex-1 relative min-h-0 bg-[#0A0A0A]">
                        <div className="absolute inset-0">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
                                value={currCode}
                                onChange={handleCodeChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16, bottom: 16 },
                                    autoClosingBrackets: 'always',
                                    formatOnPaste: true,
                                    suggestOnTriggerCharacters: true,
                                    cursorBlinking: 'smooth',
                                    cursorSmoothCaretAnimation: 'on',
                                    scrollbar: {
                                        vertical: 'visible',
                                        horizontal: 'visible',
                                        verticalScrollbarSize: 8,
                                        horizontalScrollbarSize: 8,
                                    },
                                }}
                            />
                        </div>
                    </div>

                    {/* Output Panel (Collapsible) */}
                    <AnimatePresence>
                        {outputPanel !== 'HIDDEN' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 250, opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-[#222] bg-[#0A0A0A] flex flex-col shrink-0"
                            >
                                <div className="flex items-center justify-between px-4 py-2 border-b border-[#222] bg-[#111]">
                                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
                                        <Terminal size={12} className="text-[#888]" />
                                        <span className="text-white">Execution Result</span>
                                    </div>
                                    <button onClick={() => setOutputPanel('HIDDEN')} className="text-[#888] hover:text-white">
                                        <X size={14} />
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {outputPanel === 'RUN_SUCCESS' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-green-400 font-bold font-sans text-lg">
                                                <CheckCircle2 size={18} /> Accepted (Run)
                                            </div>
                                            <div className="bg-[#111] border border-[#333] rounded-sm p-3 font-mono text-xs text-[#ccc]">
                                                <div className="text-[#888] mb-1">Stdout:</div>
                                                <div className="text-white text-opacity-80">Execution time: 14ms\nMemory usage: 42MB</div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-[#111] border border-[#333] rounded-sm p-3 font-mono text-xs">
                                                    <div className="text-[#888] mb-1">Your Output</div>
                                                    <div className="text-white">{currOp.testCases[0].output}</div>
                                                </div>
                                                <div className="flex-1 bg-[#111] border border-[#333] rounded-sm p-3 font-mono text-xs">
                                                    <div className="text-[#888] mb-1">Expected Output</div>
                                                    <div className="text-white">{currOp.testCases[0].output}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {outputPanel === 'RUN_ERROR' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-red-500 font-bold font-sans text-lg">
                                                <AlertCircle size={18} /> Runtime Error
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 font-mono text-xs text-red-400 whitespace-pre-wrap">
                                                {`Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5\n\tat Solution.networkDelayTime(Solution.java:14)\n\tat __Driver__.main(__Driver__.java:22)`}
                                            </div>
                                        </div>
                                    )}

                                    {outputPanel === 'SUBMIT_SUCCESS' && (
                                        <div className="space-y-4 flex flex-col items-center justify-center py-6">
                                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                                                <Check size={32} className="text-green-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-green-400">Accepted</h2>
                                            <p className="text-[#aaa] font-mono text-xs">Passed all {currOp.testCases.length + 20} test cases!</p>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-sm">
                                                <div className="bg-[#111] border border-[#333] p-3 rounded-sm text-center">
                                                    <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest mb-1">Runtime</div>
                                                    <div className="font-bold text-white">42 ms</div>
                                                    <div className="text-[9px] text-green-400 py-0.5 font-mono">Beats 85%</div>
                                                </div>
                                                <div className="bg-[#111] border border-[#333] p-3 rounded-sm text-center">
                                                    <div className="text-[10px] text-[#888] font-mono uppercase tracking-widest mb-1">Memory</div>
                                                    <div className="font-bold text-white">45.2 MB</div>
                                                    <div className="text-[9px] text-yellow-400 py-0.5 font-mono">Beats 42%</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {outputPanel === 'SUBMIT_ERROR' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-red-500 font-bold font-sans text-lg">
                                                <X size={18} /> Wrong Answer
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-[#aaa] font-mono">
                                                Passed <span className="font-bold text-white">12 / 38</span> testcases.
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-4 font-mono text-xs text-red-400">
                                                <div className="mb-2"><span className="text-[#888]">Failed Testcase:</span> [1,2,3,4,5]</div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <div className="text-[#888] mb-1">Your Output:</div>
                                                        <div className="text-white">15</div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[#888] mb-1">Expected:</div>
                                                        <div className="text-white">20</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Leaderboard Drawer */}
            <AnimatePresence>
                {showLeaderboard && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLeaderboard(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-14 bottom-0 right-0 w-full sm:w-96 lg:w-[450px] bg-[#0A0A0A] border-l border-[#222] shadow-2xl z-50 flex flex-col"
                        >
                            <div className="h-14 border-b border-[#222] flex items-center justify-between px-4 shrink-0 bg-[#111]">
                                <h3 className="font-bold flex items-center gap-2 font-sans tracking-widest uppercase text-sm">
                                    <Trophy size={16} className="text-accent-500" /> Real-time Leaderboard
                                </h3>
                                <button onClick={() => setShowLeaderboard(false)} className="text-[#888] hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                                <table className="w-full text-left font-mono text-xs text-[#aaa]">
                                    <thead className="bg-[#111] sticky top-0 z-10 border-b border-[#222] text-[10px] uppercase tracking-widest">
                                        <tr>
                                            <th className="px-4 py-3 font-normal">Rank</th>
                                            <th className="px-4 py-3 font-normal">User</th>
                                            <th className="px-4 py-3 font-normal text-right">Score</th>
                                            <th className="px-4 py-3 font-normal text-center hidden sm:table-cell">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#222]">
                                        {MOCK_LEADERBOARD.map((user, i) => (
                                            <tr key={i} className={`hover:bg-[#111] transition-colors ${user.username === 'KavyaIyer' ? 'bg-accent-500/5' : ''}`}>
                                                <td className="px-4 py-3">
                                                    {user.rank === 1 ? <span className="text-yellow-400 font-bold">1</span> :
                                                     user.rank === 2 ? <span className="text-[#ccc] font-bold">2</span> :
                                                     user.rank === 3 ? <span className="text-[#cd7f32] font-bold">3</span> : user.rank}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`font-bold ${user.username === 'KavyaIyer' ? 'text-accent-400' : 'text-white'}`}>{user.username}</div>
                                                    <div className="text-[10px] text-[#555]">{user.time}</div>
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-white">
                                                    {user.score}
                                                </td>
                                                <td className="px-4 py-3 hidden sm:table-cell text-[10px]">
                                                    <div className="flex gap-1 justify-center">
                                                        <span className={`w-5 h-5 flex items-center justify-center rounded-sm ${user.q1 === 'AC' ? 'bg-green-500/20 text-green-400' : user.q1 === 'WA' ? 'bg-red-500/20 text-red-500' : 'bg-[#222]'}`}>1</span>
                                                        <span className={`w-5 h-5 flex items-center justify-center rounded-sm ${user.q2 === 'AC' ? 'bg-green-500/20 text-green-400' : user.q2 === 'WA' ? 'bg-red-500/20 text-red-500' : 'bg-[#222]'}`}>2</span>
                                                        <span className={`w-5 h-5 flex items-center justify-center rounded-sm ${user.q3 === 'AC' ? 'bg-green-500/20 text-green-400' : user.q3 === 'WA' ? 'bg-red-500/20 text-red-500' : 'bg-[#222]'}`}>3</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Global scrollbar styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                  height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #333;
                  border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #555;
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
