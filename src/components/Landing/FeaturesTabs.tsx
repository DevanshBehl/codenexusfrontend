import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BrainCircuit, Swords } from 'lucide-react';

const tabs = [
    { label: 'For Students (Prep & AI Mocks)', id: 'students' },
    { label: 'For Recruiters (Live Interviews)', id: 'recruiters' },
];

export default function FeaturesTabs() {
    const [activeTab, setActiveTab] = useState('students');

    return (
        <section className="py-24 px-6 border-b border-[#333] flex flex-col bg-[#050505]" id="prep">
            <div className="flex gap-4 mb-10 text-sm max-w-6xl mx-auto w-full">
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`border px-4 py-2 font-sans font-medium text-xs rounded-[2px] transition-all duration-300 cursor-pointer relative ${
                            activeTab === tab.id
                                ? 'border-[#333] bg-[#111] text-white shadow-[0_2px_0_oklch(0.777_0.152_181.912)]'
                                : 'border-transparent text-[#666] hover:text-white hover:bg-[#0A0A0A]'
                        }`}
                    >
                        {tab.label}
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'students' ? (
                    <motion.div
                        key="students"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col md:flex-row gap-16 items-center max-w-6xl mx-auto w-full"
                    >
                        <div className="w-full md:w-1/2">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase font-sans tracking-[0.02em]"
                            >
                                MASTER THE INTERVIEW PROCESS
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-[#888] text-sm md:text-[15px] leading-[1.8] mb-8 font-mono"
                            >
                                Don't wait for your dream company to test your skills. With CodeNexus, students can practice a massive library of LeetCode-style DSA problems in the exact same IDE they will be interviewed in.
                                <br /><br />
                                Switch to <strong className="text-white">Real-Time AI Mock Interviews</strong>, where an AI evaluator acts as your interviewer—testing your logic, code efficiency, and giving instant, actionable feedback to help you improve before the real thing.
                            </motion.p>
                            <Link to="/student/interview">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.96 }}
                                    className="bg-white text-black font-bold px-4 py-2 flex items-center gap-2 hover:bg-[#e0e0e0] transition-colors text-xs font-mono rounded-[2px]"
                                >
                                    Try an AI Mock <ChevronRight size={14} />
                                </motion.button>
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center">
                            <motion.div
                                className="relative w-[300px] h-[300px] flex items-center justify-center"
                                whileHover={{ scale: 1.08, rotate: 2 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            >
                                <BrainCircuit size={160} strokeWidth={1} className="text-accent-500 drop-shadow-[0_0_30px_oklch(0.777_0.152_181.912_/_0.4)]" />
                                <div className="absolute inset-0">
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute top-10 left-10 w-3 h-3 bg-accent-400 rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.7 }} className="absolute bottom-20 right-10 w-2 h-2 bg-white rounded-full" />
                                    <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-1/2 right-4 w-4 h-4 bg-accent-400 rounded-full drop-shadow-[0_0_12px_oklch(0.777_0.152_181.912)]" />
                                    <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-8 left-16 w-2 h-2 bg-accent-500 rounded-full" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="recruiters"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col md:flex-row gap-16 items-center max-w-6xl mx-auto w-full"
                    >
                        <div className="w-full md:w-1/2">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-3xl md:text-5xl font-bold text-white mb-6 uppercase font-sans tracking-[0.02em]"
                            >
                                STREAMLINE YOUR HIRING PIPELINE
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-[#888] text-sm md:text-[15px] leading-[1.8] mb-8 font-mono"
                            >
                                Stop juggling multiple tools. CodeNexus gives recruiters a <strong className="text-white">unified dashboard</strong> to manage candidate pipelines, schedule live technical interviews, and review detailed evaluation scorecards.
                                <br /><br />
                                All sessions are recorded with <strong className="text-white">keystroke-level playback</strong>, so your hiring committee can review the exact problem-solving process—no more relying on brief interviewer notes.
                            </motion.p>
                            <Link to="/recruiter/dashboard">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
                                    whileTap={{ scale: 0.96 }}
                                    className="bg-white text-black font-bold px-4 py-2 flex items-center gap-2 hover:bg-[#e0e0e0] transition-colors text-xs font-mono rounded-[2px]"
                                >
                                    Recruiter Dashboard <ChevronRight size={14} />
                                </motion.button>
                            </Link>
                        </div>
                        <div className="w-full md:w-1/2 flex justify-center">
                            <motion.div
                                className="relative w-[300px] h-[300px] flex items-center justify-center"
                                whileHover={{ scale: 1.08, rotate: -2 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            >
                                <Swords size={140} strokeWidth={1} className="text-accent-500 drop-shadow-[0_0_30px_oklch(0.777_0.152_181.912_/_0.4)]" />
                                <div className="absolute inset-0">
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute top-16 right-8 w-3 h-3 bg-accent-400 rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute bottom-16 left-12 w-2 h-2 bg-white rounded-full" />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
