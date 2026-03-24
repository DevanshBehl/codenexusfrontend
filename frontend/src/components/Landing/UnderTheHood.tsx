import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Video, PenTool, BrainCircuit, Building2 } from 'lucide-react';

export default function UnderTheHood() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { title: "Collaborative Live IDE", icon: <Terminal size={16} /> },
        { title: "Video & Chat System", icon: <Video size={16} /> },
        { title: "Interactive Whiteboard", icon: <PenTool size={16} /> },
        { title: "AI Evaluator Analysis", icon: <BrainCircuit size={16} /> },
        { title: "University & HR Reports", icon: <Building2 size={16} /> },
    ];

    const descriptions = [
        "Instead of screen sharing, the interviewer and student connect to a lag-free collaborative IDE. Both can type, run code in multiple languages, and add test cases instantly without constantly asking 'can you show me line 42?'.",
        "Built entirely in the browser. 1-on-1 WebRTC video conferencing is built adjacent to the code editor. Say goodbye to juggling separate Zoom links. All interviews can be securely recorded for hiring committees.",
        "A fully interactive whiteboard allows candidates to draw system architecture diagrams, database schemas, and data flow charts in real-time, side by side with the interviewer.",
        "Students can take practice sessions where an AI evaluator acts as the interviewer. It challenges their code, asks follow up questions, and provides a structured evaluation scorecard to prep for the real interview.",
        "Universities and Corporate HR teams access a unified dashboard to track all student progress. They can view AI Mock reports, schedule real interviews, and parse through recorded sessions effortlessly.",
    ];

    return (
        <section className="py-24 px-6 border-b border-[#333] bg-[#050505]" id="hiring">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <h2 className="text-3xl md:text-5xl font-bold text-white uppercase font-sans tracking-tight mb-4">CODENEXUS INTERVIEW ARCHITECTURE</h2>
                <p className="text-[#888] font-mono text-xs max-w-2xl mx-auto leading-relaxed">
                    The complete toolkit for Universities and Companies to manage, execute, and analyze technical hiring cycles.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto items-stretch border border-[#222] hover:border-[#333] transition-colors duration-500"
            >
                <div className="w-full md:w-1/3 flex flex-col bg-[#0A0A0A] border-r border-[#222]">
                    {steps.map((step, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => setActiveStep(idx)}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className={`flex items-center gap-4 px-6 py-6 text-xs font-mono text-left transition-all duration-300 border-l-2 relative overflow-hidden
                                ${activeStep === idx
                                    ? 'bg-[#151515] border-accent-500 text-white'
                                    : 'border-transparent text-[#666] hover:bg-[#111] hover:text-[#aaa]'
                                }`}
                        >
                            {activeStep === idx && (
                                <motion.div
                                    layoutId="stepHighlight"
                                    className="absolute inset-0 bg-accent-500/[0.03]"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={`relative z-10 ${activeStep === idx ? 'text-accent-400' : 'text-[#555]'}`}>{step.icon}</div>
                            <span className="relative z-10">{step.title}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="w-full md:w-2/3 flex flex-col p-8 bg-[#050505]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-[#111] border border-[#222] p-8 aspect-[16/9] flex items-center justify-center relative mb-8 rounded-sm overflow-hidden"
                        >
                            {activeStep === 0 && (
                                <div className="w-full h-full border border-[#333] bg-[#050505] p-4 font-mono text-xs relative">
                                    <div className="flex justify-between text-[#555] mb-2 border-b border-[#222] pb-2">
                                        <span>index.js - Active Session</span>
                                        <span className="text-accent-500">Nodev20 - JS</span>
                                    </div>
                                    <span className="text-blue-300">console</span>.<span className="text-yellow-200">log</span>(<span className="text-green-300">"Candidate and HR code in real time"</span>);
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute top-1/2 left-10 flex flex-col">
                                        <div className="px-2 py-0.5 bg-white text-black text-[9px] font-bold rounded-sm mb-1 self-start">HR Added Testcase</div>
                                        <div className="w-0.5 h-4 bg-white" />
                                    </motion.div>
                                    <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }} className="absolute top-[60%] left-40 flex flex-col">
                                        <div className="px-2 py-0.5 bg-accent-500 text-white text-[9px] font-bold rounded-sm mb-1 self-start">Student Typing</div>
                                        <div className="w-0.5 h-4 bg-accent-500" />
                                    </motion.div>
                                </div>
                            )}

                            {activeStep === 1 && (
                                <div className="w-full h-full flex gap-4">
                                    <div className="flex-1 border border-[#333] bg-[#0A0A0A] rounded-md relative flex items-center justify-center">
                                        <div className="absolute top-2 left-2 flex items-center gap-1 text-[9px] text-[#888]"><motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-red-500" /> Recording...</div>
                                        <div className="w-8 h-8 rounded-full bg-[#333]"></div>
                                    </div>
                                    <div className="w-1/3 border border-[#333] bg-[#050505] rounded-md flex flex-col">
                                        <div className="p-2 border-b border-[#222] text-[9px] text-[#666] font-mono">Live Chat</div>
                                        <div className="p-2 flex-1 flex flex-col gap-2">
                                            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#111] rounded p-1 text-[8px] text-[#aaa] self-end max-w-[80%]">Can you explain the Big-O?</motion.div>
                                            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-accent-500/10 border border-accent-500/30 rounded p-1 text-[8px] text-accent-400 self-start max-w-[80%]">Yes! It is O(N).</motion.div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeStep === 2 && (
                                <div className="w-full h-full border border-dashed border-[#555] bg-[#0A0A0A] rounded-md relative">
                                    <svg className="w-full h-full p-4" viewBox="0 0 100 100">
                                        <motion.rect initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x="10" y="40" width="20" height="20" rx="2" fill="none" stroke="oklch(0.777 0.152 181.912)" strokeWidth="0.5" />
                                        <motion.rect initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3 }} x="70" y="40" width="20" height="20" rx="2" fill="none" stroke="#fff" strokeWidth="0.5" />
                                        <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6 }} d="M 30 50 L 65 50" stroke="#888" strokeWidth="0.5" strokeDasharray="2,2" />
                                        <polygon points="65,48 70,50 65,52" fill="#888" />
                                        <text x="20" y="52" fontSize="4" fill="#aaa" textAnchor="middle" fontFamily="monospace">Client</text>
                                        <text x="80" y="52" fontSize="4" fill="#aaa" textAnchor="middle" fontFamily="monospace">API</text>
                                    </svg>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <div className="w-4 h-4 rounded bg-[#222] flex items-center justify-center"><PenTool size={10} className="text-white" /></div>
                                        <div className="w-4 h-4 rounded bg-[#111] border border-[#333]"></div>
                                    </div>
                                </div>
                            )}

                            {activeStep === 3 && (
                                <div className="w-full h-full border border-accent-500/20 bg-accent-500/5 p-6 font-mono text-xs flex flex-col justify-center">
                                    <div className="flex items-center gap-2 text-accent-400 mb-4"><BrainCircuit size={16} /> AI Mock Complete</div>
                                    <div className="w-full h-1 bg-[#222] mb-2 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.2, ease: 'easeOut' }} className="h-full bg-accent-500 rounded-full" />
                                    </div>
                                    <div className="flex justify-between text-[#888] text-[9px] mb-4"><span>Overall Score</span><span>85/100</span></div>
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-[#aaa] text-[10px] bg-[#0a0a0a] p-2 border border-[#333] rounded-sm">
                                        "Great optimal solution using HashMap. Communication was clear, but missed edge case on line 12."
                                    </motion.div>
                                </div>
                            )}

                            {activeStep === 4 && (
                                <div className="w-full h-full border border-[#333] bg-[#0A0A0A] p-4 flex flex-col gap-2">
                                    <div className="flex justify-between pb-2 border-b border-[#222]">
                                        <span className="text-[10px] text-white">University HR Dashboard</span>
                                        <span className="text-[10px] bg-white text-black px-1 pb-0.5 rounded-sm cursor-pointer hover:bg-accent-400 transition-colors">Schedule New</span>
                                    </div>
                                    {[1, 2, 3].map((val) => (
                                        <motion.div
                                            key={val}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: val * 0.15 }}
                                            className="flex justify-between items-center bg-[#111] p-2 rounded-sm border border-[#222] hover:border-[#444] transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 bg-[#333] rounded-full"></div>
                                                <span className="text-[9px] text-[#aaa] font-mono">Student 00{val}</span>
                                            </div>
                                            <span className={`text-[9px] px-1 py-0.5 rounded-sm ${val === 1 ? 'bg-green-500/20 text-green-400' : 'bg-[#222] text-[#888]'}`}>
                                                {val === 1 ? "Passed - 92/100" : "Interview Pending"}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div>
                        <h3 className="text-lg font-bold text-white mb-4 font-mono">
                            <span className="text-accent-500">[SYSTEM]</span> {steps[activeStep].title.toUpperCase()}
                        </h3>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={activeStep}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-[#888] font-mono text-[13px] leading-[1.8] mb-4"
                            >
                                {descriptions[activeStep]}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
