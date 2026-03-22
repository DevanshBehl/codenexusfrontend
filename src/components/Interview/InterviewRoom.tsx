import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Code2,
    PenTool,
    Monitor,
    MessageSquare,
    Send,
    ChevronDown,
    ChevronUp,
    Plus,
    ListChecks,
    X
} from 'lucide-react';
import InterviewEditor from './InterviewEditor';
import InterviewProblem from './InterviewProblem';
import Whiteboard from './Whiteboard';

/* ────────── Types ────────── */
type Mode = 'video' | 'ide' | 'whiteboard';

interface InterviewRoomProps {
    role: 'student' | 'recruiter';
}

/* ────────── Mock question bank (recruiter) ────────── */
const QUESTION_BANK = [
    { id: '1', title: 'Two Sum', difficulty: 'Easy', tags: ['Array', 'Hash Map'] },
    { id: '2', title: 'Reverse Linked List', difficulty: 'Easy', tags: ['Linked List'] },
    { id: '3', title: 'LRU Cache', difficulty: 'Medium', tags: ['Hash Map', 'Linked List'] },
    { id: '4', title: 'Merge Intervals', difficulty: 'Medium', tags: ['Array', 'Sorting'] },
    { id: '5', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', tags: ['Tree', 'BFS'] },
    { id: '6', title: 'Trapping Rain Water', difficulty: 'Hard', tags: ['Array', 'Two Pointer'] },
    { id: '7', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', tags: ['Binary Search'] },
];

const difficultyStyle = (d: string) => {
    switch (d) {
        case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
        case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        case 'Hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
        default: return 'text-[#888] bg-[#111] border-[#333]';
    }
};

/* ────────── Component ────────── */
export default function InterviewRoom({ role }: InterviewRoomProps) {
    const navigate = useNavigate();
    const [mode, setMode] = useState<Mode>('video');
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [pushedQuestions, setPushedQuestions] = useState<string[]>([]);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [pipMinimized, setPipMinimized] = useState(false);

    const isRecruiter = role === 'recruiter';
    const remoteName = isRecruiter ? 'Candidate' : 'Interviewer';
    const selfName = isRecruiter ? 'Recruiter (You)' : 'Student (You)';

    const pushQuestion = (id: string) => {
        if (!pushedQuestions.includes(id)) {
            setPushedQuestions(prev => [...prev, id]);
        }
    };

    const handleEndCall = () => {
        navigate(isRecruiter ? '/company/dashboard' : '/student/dashboard');
    };

    /* ────────── Dock items ────────── */
    const dockItems = [
        {
            key: 'video' as Mode,
            icon: Monitor,
            label: 'Video Call',
            active: mode === 'video',
            onClick: () => setMode('video'),
        },
        {
            key: 'ide' as Mode,
            icon: Code2,
            label: 'IDE',
            active: mode === 'ide',
            onClick: () => setMode('ide'),
        },
        {
            key: 'whiteboard' as Mode,
            icon: PenTool,
            label: 'Whiteboard',
            active: mode === 'whiteboard',
            onClick: () => setMode('whiteboard'),
        },
    ];

    /* ────────── Video panel (PiP when in ide/whiteboard) ────────── */
    const renderVideoFull = () => (
        <div className="flex-1 flex items-center justify-center relative p-6">
            {/* Remote (large) */}
            <div className="relative w-full max-w-4xl aspect-video bg-[#0A0A0A] border border-[#222] rounded-lg overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#111]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-accent-600 to-[#6b21a8] flex items-center justify-center text-3xl font-bold shadow-xl border-2 border-accent-500/30">
                        {remoteName.slice(0, 2).toUpperCase()}
                    </div>
                </div>
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-2 border border-[#333] text-white">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    {remoteName}
                </div>
            </div>

            {/* Self (small PiP, bottom-right) */}
            <div className="absolute bottom-8 right-8 w-52 aspect-video bg-[#111] border border-accent-500/30 rounded-lg overflow-hidden shadow-xl">
                <div className="absolute inset-0 flex items-center justify-center">
                    {isCameraOff ? (
                        <VideoOff size={28} className="text-[#444]" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                            <Video size={24} className="text-[#444]" />
                        </div>
                    )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-sm text-[10px] font-mono text-accent-400 border border-accent-500/20">
                    {selfName}
                </div>
                {isMuted && (
                    <div className="absolute top-2 right-2 p-1 bg-red-500/20 rounded-full border border-red-500/30">
                        <MicOff size={10} className="text-red-400" />
                    </div>
                )}
            </div>
        </div>
    );

    const renderVideoPip = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 z-30 flex flex-col gap-2"
        >
            {/* Toggle */}
            <button
                onClick={() => setPipMinimized(!pipMinimized)}
                className="self-end p-1 bg-[#111] border border-[#333] rounded-sm text-[#888] hover:text-white transition-colors"
            >
                {pipMinimized ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>

            <AnimatePresence>
                {!pipMinimized && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col gap-2"
                    >
                        {/* Remote */}
                        <div className="w-48 aspect-video bg-[#0A0A0A] border border-[#222] rounded-lg overflow-hidden shadow-xl relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-600 to-[#6b21a8] flex items-center justify-center text-sm font-bold">
                                    {remoteName.slice(0, 2).toUpperCase()}
                                </div>
                            </div>
                            <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded-sm text-[9px] font-mono text-white border border-[#333]">
                                {remoteName}
                            </div>
                        </div>
                        {/* Self */}
                        <div className="w-48 aspect-video bg-[#111] border border-accent-500/20 rounded-lg overflow-hidden shadow-xl relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {isCameraOff ? (
                                    <VideoOff size={18} className="text-[#444]" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                                        <Video size={14} className="text-[#444]" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded-sm text-[9px] font-mono text-accent-400 border border-accent-500/20">
                                {selfName}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    /* ────────── IDE mode ────────── */
    const renderIDE = () => (
        <div className="flex-1 flex relative min-h-0">
            {renderVideoPip()}

            {/* Recruiter: Push Question panel */}
            {isRecruiter && (
                <AnimatePresence>
                    {showQuestionBank && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-r border-[#222] bg-[#0A0A0A] flex flex-col overflow-hidden shrink-0"
                        >
                            <div className="h-12 border-b border-[#222] flex items-center justify-between px-4 bg-[#111]">
                                <h3 className="text-xs font-mono uppercase tracking-widest text-accent-400 flex items-center gap-2">
                                    <ListChecks size={14} /> Question Bank
                                </h3>
                                <button
                                    onClick={() => setShowQuestionBank(false)}
                                    className="text-[#666] hover:text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {QUESTION_BANK.map(q => {
                                    const isPushed = pushedQuestions.includes(q.id);
                                    return (
                                        <div
                                            key={q.id}
                                            className={`p-3 border rounded-sm transition-colors ${
                                                isPushed
                                                    ? 'border-accent-500/30 bg-accent-500/5'
                                                    : 'border-[#222] bg-[#050505] hover:border-[#444]'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-sans font-bold text-white">{q.title}</span>
                                                <span className={`text-[8px] font-mono px-1.5 py-0.5 border rounded-sm uppercase tracking-widest ${difficultyStyle(q.difficulty)}`}>
                                                    {q.difficulty}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {q.tags.map(t => (
                                                    <span key={t} className="text-[8px] font-mono text-[#666] bg-[#111] px-1.5 py-0.5 border border-[#222] rounded-sm">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => pushQuestion(q.id)}
                                                disabled={isPushed}
                                                className={`w-full text-[9px] font-mono uppercase tracking-widest py-1.5 rounded-sm border transition-colors flex items-center justify-center gap-1 ${
                                                    isPushed
                                                        ? 'border-accent-500/20 text-accent-400 bg-accent-500/10 cursor-default'
                                                        : 'border-[#333] text-[#aaa] hover:border-accent-500 hover:text-accent-400 hover:bg-accent-500/5'
                                                }`}
                                            >
                                                {isPushed ? (
                                                    <>✓ Pushed</>
                                                ) : (
                                                    <><Send size={9} /> Push to Candidate</>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* IDE grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-0 min-h-0">
                <div className="col-span-1 border-r border-[#222] flex flex-col min-h-0">
                    <InterviewProblem />
                </div>
                <div className="col-span-3 flex flex-col min-h-0">
                    <InterviewEditor />
                </div>
            </div>
        </div>
    );

    /* ────────── Whiteboard mode ────────── */
    const renderWhiteboard = () => (
        <div className="flex-1 flex relative min-h-0">
            {renderVideoPip()}
            <Whiteboard />
        </div>
    );

    /* ────────── Main Render ────────── */
    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white flex flex-col overflow-hidden relative">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg" />

            {/* Top bar */}
            <header className="h-12 border-b border-[#222] flex items-center justify-between px-5 bg-[#0A0A0A]/90 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-sm bg-accent-500/20 border border-accent-500/50 flex items-center justify-center">
                        <span className="text-accent-400 font-bold font-mono text-xs">CN</span>
                    </div>
                    <span className="font-semibold text-white/90 text-sm">Interview Room</span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-widest ${
                        isRecruiter
                            ? 'text-accent-400 bg-accent-500/10 border-accent-500/20'
                            : 'text-green-400 bg-green-500/10 border-green-500/20'
                    }`}>
                        {role}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#888]">
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        01:45:22 remaining
                    </span>
                </div>
            </header>

            {/* Main area */}
            <main className="flex-1 flex flex-col relative z-10 min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="flex-1 flex flex-col min-h-0"
                    >
                        {mode === 'video' && renderVideoFull()}
                        {mode === 'ide' && renderIDE()}
                        {mode === 'whiteboard' && renderWhiteboard()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Dock Bar */}
            <div className="relative z-20 flex items-center justify-center py-3 bg-gradient-to-t from-[#0A0A0A] to-transparent">
                <div className="flex items-center gap-2 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#333] rounded-2xl px-4 py-2 shadow-2xl">
                    {/* Mode buttons */}
                    {dockItems.map(item => (
                        <button
                            key={item.key}
                            onClick={item.onClick}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                                item.active
                                    ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                                    : 'text-[#888] hover:text-white hover:bg-[#222] border border-transparent'
                            }`}
                        >
                            <item.icon size={18} />
                            <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline">{item.label}</span>
                        </button>
                    ))}

                    <div className="w-px h-8 bg-[#333] mx-2" />

                    {/* Recruiter: Push Question button (only in IDE mode) */}
                    {isRecruiter && mode === 'ide' && (
                        <>
                            <button
                                onClick={() => setShowQuestionBank(!showQuestionBank)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                                    showQuestionBank
                                        ? 'bg-accent-500/15 text-accent-400 border border-accent-500/30'
                                        : 'text-[#888] hover:text-white hover:bg-[#222] border border-transparent'
                                }`}
                                title="Push Question"
                            >
                                <Plus size={18} />
                                <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline">Push Q</span>
                            </button>
                            <div className="w-px h-8 bg-[#333] mx-2" />
                        </>
                    )}

                    {/* Mute */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2.5 rounded-xl transition-all border ${
                            isMuted
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'text-white hover:bg-[#222] border-transparent'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {/* Camera */}
                    <button
                        onClick={() => setIsCameraOff(!isCameraOff)}
                        className={`p-2.5 rounded-xl transition-all border ${
                            isCameraOff
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'text-white hover:bg-[#222] border-transparent'
                        }`}
                        title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
                    >
                        {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
                    </button>

                    {/* Chat */}
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-2.5 rounded-xl transition-all border ${
                            showChat
                                ? 'bg-accent-500/15 text-accent-400 border-accent-500/30'
                                : 'text-[#888] hover:text-white hover:bg-[#222] border-transparent'
                        }`}
                        title="Chat"
                    >
                        <MessageSquare size={18} />
                    </button>

                    <div className="w-px h-8 bg-[#333] mx-2" />

                    {/* End Call */}
                    <button
                        onClick={() => setShowEndConfirm(true)}
                        className="px-4 py-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center gap-2"
                        title="End Call"
                    >
                        <PhoneOff size={18} />
                        <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:inline">End</span>
                    </button>
                </div>
            </div>

            {/* Chat sidebar */}
            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ x: 350, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 350, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="absolute top-12 right-0 bottom-16 w-80 z-30 bg-[#0A0A0A] border-l border-[#222] flex flex-col"
                    >
                        <div className="h-11 border-b border-[#222] flex items-center justify-between px-4 bg-[#111] shrink-0">
                            <h2 className="text-xs font-mono uppercase tracking-widest text-accent-400 flex items-center gap-2">
                                <MessageSquare size={12} /> Meeting Chat
                            </h2>
                            <button onClick={() => setShowChat(false)} className="text-[#666] hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-[#666] font-mono">{remoteName} • 10:02 AM</span>
                                <div className="bg-[#111] rounded-sm rounded-tl-none p-3 text-xs text-[#aaa] border border-[#222] inline-block self-start shadow-sm font-mono">
                                    Hello! Welcome to the interview. Let's get started.
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                                <span className="text-[10px] text-accent-500 font-mono">You • 10:03 AM</span>
                                <div className="bg-accent-500/10 rounded-sm rounded-tr-none p-3 text-xs text-white border border-accent-500/30 inline-block self-end shadow-sm font-mono">
                                    Hi, thank you! Ready to go.
                                </div>
                            </div>
                        </div>

                        <div className="p-3 border-t border-[#222] bg-[#050505] shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="w-full bg-[#111] border border-[#333] rounded-sm py-2 pl-3 pr-10 text-xs text-white placeholder-[#555] focus:outline-none focus:border-accent-500/50 transition-colors font-mono"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-sm text-[#555] hover:text-accent-400 transition-colors">
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pushed questions indicator for student */}
            {!isRecruiter && pushedQuestions.length > 0 && mode === 'ide' && (
                <div className="absolute top-14 left-4 z-30 bg-accent-500/10 border border-accent-500/30 rounded-sm px-3 py-2 flex items-center gap-2">
                    <ListChecks size={14} className="text-accent-400" />
                    <span className="text-[10px] font-mono text-accent-400 uppercase tracking-widest">
                        {pushedQuestions.length} question{pushedQuestions.length > 1 ? 's' : ''} assigned
                    </span>
                </div>
            )}

            {/* End call confirmation */}
            <AnimatePresence>
                {showEndConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                        onClick={() => setShowEndConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0A0A0A] border border-[#333] rounded-sm p-6 max-w-sm w-full mx-4 shadow-2xl"
                        >
                            <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white mb-2">
                                End Interview?
                            </h3>
                            <p className="text-xs font-mono text-[#888] mb-6">
                                Are you sure you want to end this interview session? This action cannot be undone.
                            </p>
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => setShowEndConfirm(false)}
                                    className="px-4 py-2 border border-[#333] text-[#888] font-mono text-xs uppercase tracking-widest hover:text-white hover:border-[#555] transition-colors rounded-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleEndCall}
                                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 font-mono text-xs uppercase tracking-widest hover:bg-red-500/30 transition-colors rounded-sm flex items-center gap-2"
                                >
                                    <PhoneOff size={14} /> End Call
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scrollbar styles */}
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
}
