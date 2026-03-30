import { useState } from 'react';
import { contestApi } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Trophy,
    Code2,
    CheckCircle2,
    Plus,
    Trash2,
    ArrowLeft,
    ArrowRight,
    Sparkles,
    AlertCircle,
    ClipboardList,
    Layers,
    Send,
    X
} from 'lucide-react';

/* ────────── Types ────────── */
interface TestCase {
    input: string;
    expectedOutput: string;
}

interface Question {
    id: string;
    title: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    points: number;
    statement: string;
    constraints: string;
    testCases: TestCase[];
}

interface ContestData {
    title: string;
    description: string;
    scheduledDate: string;
    duration: string;
    timeLimitMinutes: number;
    languages: string[];
    questions: Question[];
}

/* ────────── Constants ────────── */
const AVAILABLE_LANGUAGES = [
    { name: 'Python', icon: '🐍' },
    { name: 'JavaScript', icon: 'JS' },
    { name: 'TypeScript', icon: 'TS' },
    { name: 'Java', icon: '☕' },
    { name: 'C++', icon: '⚙️' },
    { name: 'C', icon: 'C' },
    { name: 'Go', icon: '🔷' },
    { name: 'Rust', icon: '🦀' },
    { name: 'Kotlin', icon: 'Kt' },
    { name: 'Swift', icon: '🐦' },
    { name: 'Ruby', icon: '💎' },
    { name: 'C#', icon: 'C#' },
];

const STEPS = [
    { label: 'Contest Details', icon: ClipboardList },
    { label: 'Languages', icon: Code2 },
    { label: 'Questions', icon: Layers },
    { label: 'Review & Schedule', icon: Send },
];

const DIFFICULTY_STYLES: Record<string, string> = {
    EASY: 'text-green-400 bg-green-500/10 border-green-500/20',
    MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    HARD: 'text-red-400 bg-red-500/10 border-red-500/20',
};

/* ────────── Helpers ────────── */
const generateId = () => Math.random().toString(36).slice(2, 12);

const emptyTestCase = (): TestCase => ({ input: '', expectedOutput: '' });

const emptyQuestion = (): Question => ({
    id: generateId(),
    title: '',
    difficulty: 'MEDIUM',
    points: 100,
    statement: '',
    constraints: '',
    testCases: [emptyTestCase()],
});

/* ────────── Component ────────── */
const CreateContest = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    const [contest, setContest] = useState<ContestData>({
        title: '',
        description: '',
        scheduledDate: '',
        duration: '2 hours',
        timeLimitMinutes: 30,
        languages: ['Python', 'JavaScript', 'C++'],
        questions: [emptyQuestion()],
    });

    /* ── field helpers ── */
    const updateField = <K extends keyof ContestData>(key: K, value: ContestData[K]) =>
        setContest(prev => ({ ...prev, [key]: value }));

    const toggleLanguage = (lang: string) =>
        updateField(
            'languages',
            contest.languages.includes(lang)
                ? contest.languages.filter(l => l !== lang)
                : [...contest.languages, lang],
        );

    /* question helpers */
    const updateQuestion = (id: string, patch: Partial<Question>) =>
        updateField('questions', contest.questions.map(q => (q.id === id ? { ...q, ...patch } : q)));

    const addQuestion = () => {
        const q = emptyQuestion();
        updateField('questions', [...contest.questions, q]);
        setExpandedQuestion(q.id);
    };

    const removeQuestion = (id: string) => {
        if (contest.questions.length <= 1) return;
        updateField('questions', contest.questions.filter(q => q.id !== id));
        if (expandedQuestion === id) setExpandedQuestion(null);
    };

    /* test case helpers */
    const addTestCase = (qId: string) =>
        updateQuestion(qId, {
            testCases: [
                ...(contest.questions.find(q => q.id === qId)?.testCases ?? []),
                emptyTestCase(),
            ],
        });

    const removeTestCase = (qId: string, idx: number) => {
        const q = contest.questions.find(q => q.id === qId);
        if (!q || q.testCases.length <= 1) return;
        updateQuestion(qId, { testCases: q.testCases.filter((_, i) => i !== idx) });
    };

    const updateTestCase = (qId: string, idx: number, patch: Partial<TestCase>) => {
        const q = contest.questions.find(q => q.id === qId);
        if (!q) return;
        updateQuestion(qId, {
            testCases: q.testCases.map((tc, i) => (i === idx ? { ...tc, ...patch } : tc)),
        });
    };

    /* ── validation ── */
    const canProceed = (): boolean => {
        switch (step) {
            case 0:
                return contest.title.trim().length > 0 && contest.scheduledDate.length > 0;
            case 1:
                return contest.languages.length > 0;
            case 2:
                return (
                    contest.questions.length > 0 &&
                    contest.questions.every(
                        q =>
                            q.title.trim().length > 0 &&
                            q.statement.trim().length > 0 &&
                            q.testCases.length > 0 &&
                            q.testCases.every(tc => tc.input.trim().length > 0 && tc.expectedOutput.trim().length > 0),
                    )
                );
            default:
                return true;
        }
    };

    const handleCreate = async () => {
        try {
            // Parse duration string (e.g. "2 hours") into minutes
            const durationMap: Record<string, number> = {
                '1 hour': 60,
                '1.5 hours': 90,
                '2 hours': 120,
                '3 hours': 180,
                '4 hours': 240,
            };
            const durationMins = durationMap[contest.duration] || 120;

            await contestApi.create({
                title: contest.title,
                description: contest.description || undefined,
                scheduledDate: contest.scheduledDate,
                durationMins,
                timeLimitMinutes: contest.timeLimitMinutes,
                languages: contest.languages,
                questions: contest.questions.map(q => ({
                    title: q.title,
                    difficulty: q.difficulty,
                    points: q.points,
                    statement: q.statement,
                    constraints: q.constraints || undefined,
                    testCases: q.testCases.map(tc => ({
                        input: tc.input,
                        expectedOutput: tc.expectedOutput,
                    })),
                })),
            });

            setShowSuccess(true);
            setTimeout(() => {
                navigate('/company/dashboard');
            }, 2000);
        } catch (err: any) {
            console.error('Failed to create contest:', err);
            alert(err.message || 'Failed to create contest');
        }
    };

    /* ────────── Render helpers ────────── */
    const inputClass =
        'w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2.5 text-xs font-mono text-white placeholder:text-[#444] outline-none focus:border-accent-500 transition-colors';
    const labelClass = 'text-[10px] font-mono uppercase tracking-widest text-[#888] block mb-2';
    const selectClass =
        'w-full bg-[#050505] border border-[#333] rounded-sm px-3 py-2.5 text-xs font-mono text-white outline-none focus:border-accent-500 transition-colors';

    /* ── Step 1 ── */
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className={labelClass}>Contest Title *</label>
                    <input
                        className={inputClass}
                        placeholder="e.g., SDE I Hiring Challenge — Spring 2026"
                        value={contest.title}
                        onChange={e => updateField('title', e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className={labelClass}>Description / Instructions</label>
                    <textarea
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder="Describe what this contest evaluates, rules, and any special instructions for candidates..."
                        value={contest.description}
                        onChange={e => updateField('description', e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Scheduled Date & Time *</label>
                    <input
                        type="datetime-local"
                        className={`${inputClass} [color-scheme:dark]`}
                        value={contest.scheduledDate}
                        onChange={e => updateField('scheduledDate', e.target.value)}
                    />
                </div>
                <div>
                    <label className={labelClass}>Contest Duration</label>
                    <select
                        className={selectClass}
                        value={contest.duration}
                        onChange={e => updateField('duration', e.target.value)}
                    >
                        <option>1 hour</option>
                        <option>1.5 hours</option>
                        <option>2 hours</option>
                        <option>3 hours</option>
                        <option>4 hours</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Per-Problem Time Limit (minutes)</label>
                    <input
                        type="number"
                        min={5}
                        max={120}
                        className={inputClass}
                        value={contest.timeLimitMinutes}
                        onChange={e => updateField('timeLimitMinutes', Number(e.target.value))}
                    />
                    <p className="text-[9px] font-mono text-[#555] mt-1">Individual time limit per problem (5–120 min)</p>
                </div>
            </div>
        </div>
    );

    /* ── Step 2 ── */
    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#888] uppercase tracking-widest">
                <Code2 size={14} className="text-accent-400" />
                Select at least one accepted language
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {AVAILABLE_LANGUAGES.map(lang => {
                    const selected = contest.languages.includes(lang.name);
                    return (
                        <motion.button
                            key={lang.name}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toggleLanguage(lang.name)}
                            className={`relative flex items-center gap-3 px-4 py-3.5 border rounded-sm transition-all duration-200 cursor-pointer group ${
                                selected
                                    ? 'border-accent-500/50 bg-accent-500/10 text-white'
                                    : 'border-[#222] bg-[#0A0A0A] text-[#666] hover:border-[#444] hover:text-white'
                            }`}
                        >
                            <span className="text-base leading-none">{lang.icon}</span>
                            <span className="text-xs font-mono uppercase tracking-widest">{lang.name}</span>
                            {selected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-1.5 right-1.5"
                                >
                                    <CheckCircle2 size={12} className="text-accent-400" />
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Selected:</span>
                {contest.languages.length === 0 ? (
                    <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                        <AlertCircle size={10} /> Select at least one
                    </span>
                ) : (
                    contest.languages.map(l => (
                        <span
                            key={l}
                            className="text-[9px] font-mono text-accent-400 bg-accent-500/10 border border-accent-500/20 px-2 py-0.5 rounded-sm flex items-center gap-1.5"
                        >
                            {l}
                            <button onClick={() => toggleLanguage(l)} className="hover:text-red-400 transition-colors">
                                <X size={8} />
                            </button>
                        </span>
                    ))
                )}
            </div>
        </div>
    );

    /* ── Step 3 ── */
    const renderStep3 = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#888] uppercase tracking-widest">
                    <Layers size={14} className="text-accent-400" />
                    {contest.questions.length} Question{contest.questions.length !== 1 ? 's' : ''}
                </div>
                <button
                    onClick={addQuestion}
                    className="px-3 py-1.5 bg-[#111] border border-[#333] text-[10px] font-mono uppercase tracking-widest text-[#aaa] hover:text-white hover:border-accent-500 transition-colors rounded-sm flex items-center gap-2"
                >
                    <Plus size={12} /> Add Question
                </button>
            </div>

            <AnimatePresence>
                {contest.questions.map((q, qi) => {
                    const isExpanded = expandedQuestion === q.id;
                    return (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12, height: 0 }}
                            className="bg-[#0A0A0A] border border-[#222] rounded-sm overflow-hidden"
                        >
                            {/* Accordion Header */}
                            <button
                                onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-[#050505] transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 bg-[#111] border border-[#333] rounded-sm flex items-center justify-center text-[10px] font-mono font-bold text-accent-400">
                                        {qi + 1}
                                    </span>
                                    <span className="text-sm font-sans font-bold text-white truncate max-w-[300px]">
                                        {q.title || 'Untitled Question'}
                                    </span>
                                    <span
                                        className={`text-[9px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-widest ${DIFFICULTY_STYLES[q.difficulty]}`}
                                    >
                                        {q.difficulty}
                                    </span>
                                    <span className="text-[9px] font-mono text-[#555]">{q.points} pts</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {contest.questions.length > 1 && (
                                        <span
                                            onClick={e => {
                                                e.stopPropagation();
                                                removeQuestion(q.id);
                                            }}
                                            className="p-1.5 text-[#555] hover:text-red-400 transition-colors cursor-pointer"
                                        >
                                            <Trash2 size={13} />
                                        </span>
                                    )}
                                    {isExpanded ? (
                                        <ChevronUp size={16} className="text-[#555]" />
                                    ) : (
                                        <ChevronDown size={16} className="text-[#555]" />
                                    )}
                                </div>
                            </button>

                            {/* Accordion Body */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-[#1a1a1a] p-5 space-y-5">
                                            {/* Title, difficulty, points row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-1">
                                                    <label className={labelClass}>Question Title *</label>
                                                    <input
                                                        className={inputClass}
                                                        placeholder="e.g., Two Sum"
                                                        value={q.title}
                                                        onChange={e => updateQuestion(q.id, { title: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Difficulty</label>
                                                    <select
                                                        className={selectClass}
                                                        value={q.difficulty}
                                                        onChange={e =>
                                                            updateQuestion(q.id, {
                                                                difficulty: e.target.value as Question['difficulty'],
                                                            })
                                                        }
                                                    >
                                                        <option value="EASY">Easy</option>
                                                        <option value="MEDIUM">Medium</option>
                                                        <option value="HARD">Hard</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Points</label>
                                                    <input
                                                        type="number"
                                                        min={10}
                                                        className={inputClass}
                                                        value={q.points}
                                                        onChange={e =>
                                                            updateQuestion(q.id, { points: Number(e.target.value) })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {/* Problem statement */}
                                            <div>
                                                <label className={labelClass}>Problem Statement *</label>
                                                <textarea
                                                    rows={5}
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="Describe the problem clearly. Include input/output format, examples in the description..."
                                                    value={q.statement}
                                                    onChange={e => updateQuestion(q.id, { statement: e.target.value })}
                                                />
                                            </div>

                                            {/* Constraints */}
                                            <div>
                                                <label className={labelClass}>Constraints</label>
                                                <textarea
                                                    rows={3}
                                                    className={`${inputClass} resize-none`}
                                                    placeholder="e.g., 1 ≤ n ≤ 10⁵, 0 ≤ nums[i] ≤ 10⁹"
                                                    value={q.constraints}
                                                    onChange={e =>
                                                        updateQuestion(q.id, { constraints: e.target.value })
                                                    }
                                                />
                                            </div>

                                            {/* Sample Test Cases */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className={labelClass + ' mb-0'}>
                                                        Sample Test Cases *
                                                    </label>
                                                    <button
                                                        onClick={() => addTestCase(q.id)}
                                                        className="text-[9px] font-mono uppercase tracking-widest text-accent-400 hover:text-accent-500 transition-colors flex items-center gap-1"
                                                    >
                                                        <Plus size={10} /> Add Test Case
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {q.testCases.map((tc, tci) => (
                                                        <motion.div
                                                            key={tci}
                                                            initial={{ opacity: 0, x: -8 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="relative bg-[#050505] border border-[#1a1a1a] rounded-sm p-4"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest">
                                                                    Test Case #{tci + 1}
                                                                </span>
                                                                {q.testCases.length > 1 && (
                                                                    <button
                                                                        onClick={() => removeTestCase(q.id, tci)}
                                                                        className="text-[#444] hover:text-red-400 transition-colors"
                                                                    >
                                                                        <Trash2 size={11} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <div>
                                                                    <label className="text-[9px] font-mono uppercase tracking-widest text-[#555] block mb-1">
                                                                        Input
                                                                    </label>
                                                                    <textarea
                                                                        rows={3}
                                                                        className={`${inputClass} resize-none text-[11px]`}
                                                                        placeholder="[2, 7, 11, 15]&#10;9"
                                                                        value={tc.input}
                                                                        onChange={e =>
                                                                            updateTestCase(q.id, tci, {
                                                                                input: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[9px] font-mono uppercase tracking-widest text-[#555] block mb-1">
                                                                        Expected Output
                                                                    </label>
                                                                    <textarea
                                                                        rows={3}
                                                                        className={`${inputClass} resize-none text-[11px]`}
                                                                        placeholder="[0, 1]"
                                                                        value={tc.expectedOutput}
                                                                        onChange={e =>
                                                                            updateTestCase(q.id, tci, {
                                                                                expectedOutput: e.target.value,
                                                                            })
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );

    /* ── Step 4 — Review ── */
    const renderStep4 = () => (
        <div className="space-y-6">
            {/* Contest Details Summary */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
                        <ClipboardList size={14} className="text-accent-400" /> Contest Details
                    </h4>
                    <button onClick={() => setStep(0)} className="text-[9px] font-mono text-accent-400 hover:text-accent-500 uppercase tracking-widest transition-colors">
                        Edit
                    </button>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest block">Title</span>
                        <span className="text-sm font-sans font-bold text-white">{contest.title || '—'}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest block">Scheduled</span>
                        <span className="text-sm font-mono text-white">
                            {contest.scheduledDate ? new Date(contest.scheduledDate).toLocaleString() : '—'}
                        </span>
                    </div>
                    <div>
                        <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest block">Duration</span>
                        <span className="text-sm font-mono text-white">{contest.duration}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest block">Per-Problem Time Limit</span>
                        <span className="text-sm font-mono text-white">{contest.timeLimitMinutes} minutes</span>
                    </div>
                    {contest.description && (
                        <div className="md:col-span-2">
                            <span className="text-[9px] font-mono text-[#555] uppercase tracking-widest block mb-1">Description</span>
                            <p className="text-xs font-mono text-[#aaa] whitespace-pre-wrap">{contest.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Languages Summary */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
                        <Code2 size={14} className="text-accent-400" /> Accepted Languages
                    </h4>
                    <button onClick={() => setStep(1)} className="text-[9px] font-mono text-accent-400 hover:text-accent-500 uppercase tracking-widest transition-colors">
                        Edit
                    </button>
                </div>
                <div className="p-5 flex flex-wrap gap-2">
                    {contest.languages.map(l => (
                        <span key={l} className="text-[10px] font-mono text-accent-400 bg-accent-500/10 border border-accent-500/20 px-3 py-1 rounded-sm">
                            {l}
                        </span>
                    ))}
                </div>
            </div>

            {/* Questions Summary */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-sm">
                <div className="flex items-center justify-between p-5 border-b border-[#1a1a1a]">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-white flex items-center gap-2">
                        <Layers size={14} className="text-accent-400" /> Questions ({contest.questions.length})
                    </h4>
                    <button onClick={() => setStep(2)} className="text-[9px] font-mono text-accent-400 hover:text-accent-500 uppercase tracking-widest transition-colors">
                        Edit
                    </button>
                </div>
                <div className="divide-y divide-[#1a1a1a]">
                    {contest.questions.map((q, qi) => (
                        <div key={q.id} className="p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-6 h-6 bg-[#111] border border-[#333] rounded-sm flex items-center justify-center text-[9px] font-mono font-bold text-accent-400">
                                    {qi + 1}
                                </span>
                                <span className="text-sm font-sans font-bold text-white">{q.title || 'Untitled'}</span>
                                <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-sm uppercase tracking-widest ${DIFFICULTY_STYLES[q.difficulty]}`}>
                                    {q.difficulty}
                                </span>
                                <span className="text-[9px] font-mono text-[#555]">{q.points} pts</span>
                            </div>
                            {q.statement && (
                                <p className="text-xs font-mono text-[#888] mb-2 line-clamp-2">{q.statement}</p>
                            )}
                            {q.constraints && (
                                <p className="text-[10px] font-mono text-[#555] mb-2">
                                    <span className="text-[#666]">Constraints:</span> {q.constraints}
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-[9px] font-mono text-[#555] uppercase tracking-widest">
                                <span>{q.testCases.length} test case{q.testCases.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Points */}
            <div className="bg-[#0A0A0A] border border-accent-500/20 rounded-sm p-5 flex items-center justify-between">
                <span className="text-xs font-mono text-[#888] uppercase tracking-widest">Total Points</span>
                <span className="text-2xl font-bold font-sans text-accent-400">
                    {contest.questions.reduce((sum, q) => sum + q.points, 0)}
                </span>
            </div>
        </div>
    );

    const STEP_RENDERERS = [renderStep1, renderStep2, renderStep3, renderStep4];

    /* ────────── Main Render ────────── */
    return (
        <div className="h-screen w-full bg-[#050505] font-sans text-white selection:bg-accent-500/30 selection:text-white relative overflow-hidden flex flex-col">
            {/* Background Dots */}
            <div className="fixed inset-0 pointer-events-none z-0 dotted-bg"></div>

            {/* Top Bar */}
            <header className="relative z-20 border-b border-[#222] bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/company/dashboard"
                            className="p-2 border border-[#333] rounded-sm text-[#888] hover:text-white hover:border-accent-500 transition-colors"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold font-sans uppercase tracking-tight text-white flex items-center gap-2">
                                <Trophy size={18} className="text-accent-400" />
                                Create Contest
                            </h1>
                            <p className="text-[10px] font-mono text-[#555] tracking-widest">
                                /company/contests/create
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#555]">
                        <Terminal size={12} className="text-accent-400" />
                        <span className="hidden sm:inline uppercase tracking-widest">Code Arena</span>
                    </div>
                </div>
            </header>

            {/* Step Progress Bar */}
            <div className="relative z-20 border-b border-[#1a1a1a] bg-[#080808]">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-0">
                        {STEPS.map((s, i) => (
                            <div key={i} className="flex items-center flex-1 last:flex-none">
                                <button
                                    onClick={() => {
                                        /* only allow going back or to current/completed */
                                        if (i <= step) setStep(i);
                                    }}
                                    className={`flex items-center gap-2 cursor-pointer transition-colors ${
                                        i === step
                                            ? 'text-accent-400'
                                            : i < step
                                              ? 'text-green-400'
                                              : 'text-[#444]'
                                    }`}
                                >
                                    <span
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                                            i === step
                                                ? 'border-accent-500 bg-accent-500/10 text-accent-400'
                                                : i < step
                                                  ? 'border-green-500/50 bg-green-500/10 text-green-400'
                                                  : 'border-[#333] bg-[#111] text-[#555]'
                                        }`}
                                    >
                                        {i < step ? <CheckCircle2 size={14} /> : i + 1}
                                    </span>
                                    <span className="text-[9px] font-mono uppercase tracking-widest hidden md:inline whitespace-nowrap">
                                        {s.label}
                                    </span>
                                </button>
                                {i < STEPS.length - 1 && (
                                    <div className="flex-1 mx-3">
                                        <div className={`h-[1px] w-full ${i < step ? 'bg-green-500/40' : 'bg-[#222]'}`} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    {/* Step Header */}
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {(() => {
                                const Icon = STEPS[step].icon;
                                return <Icon size={20} className="text-accent-400" />;
                            })()}
                            <h2 className="text-xl font-bold font-sans uppercase tracking-wide text-white">
                                {STEPS[step].label}
                            </h2>
                        </div>
                        <div className="h-[1px] bg-gradient-to-r from-accent-500/40 via-accent-500/10 to-transparent" />
                    </motion.div>

                    {/* Step Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {STEP_RENDERERS[step]()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Bottom Navigation */}
            <footer className="relative z-20 border-t border-[#222] bg-[#0A0A0A]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        {step > 0 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 border border-[#333] text-[#888] px-4 py-2.5 font-bold hover:text-white hover:border-[#555] transition-colors text-xs font-mono uppercase tracking-widest rounded-sm"
                            >
                                <ChevronLeft size={14} /> Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/company/dashboard"
                            className="border border-[#333] text-[#666] px-4 py-2.5 font-bold hover:text-white hover:border-[#555] transition-colors text-xs font-mono uppercase tracking-widest rounded-sm"
                        >
                            Cancel
                        </Link>
                        {step < STEPS.length - 1 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={!canProceed()}
                                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs font-mono uppercase tracking-widest rounded-sm transition-all ${
                                    canProceed()
                                        ? 'bg-[#e0e0e0] text-black hover:bg-white'
                                        : 'bg-[#222] text-[#555] cursor-not-allowed'
                                }`}
                            >
                                Next <ArrowRight size={14} />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 bg-accent-500 text-black px-5 py-2.5 font-bold hover:bg-accent-400 transition-colors text-xs font-mono uppercase tracking-widest rounded-sm"
                            >
                                <Sparkles size={14} /> Create Contest
                            </button>
                        )}
                    </div>
                </div>
            </footer>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-green-500/10 border border-green-500/30 backdrop-blur-sm px-6 py-3 rounded-sm flex items-center gap-3"
                    >
                        <CheckCircle2 size={18} className="text-green-400" />
                        <span className="text-sm font-mono text-green-400 uppercase tracking-widest">
                            Contest created successfully!
                        </span>
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
          border-left: 1px solid #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}} />
        </div>
    );
};

export default CreateContest;
