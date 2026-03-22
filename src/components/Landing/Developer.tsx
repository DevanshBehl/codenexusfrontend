import { Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Developer() {
    return (
        <section className="py-24 px-6 md:px-12 bg-[#050505] border-t border-[#222] relative overflow-hidden flex flex-col items-center justify-center">
            
            {/* Background flourish */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl w-full flex flex-col items-center text-center relative z-10"
            >
                <div className="inline-flex items-center gap-2 border border-[#333] bg-[#111] px-3 py-1.5 text-[10px] text-[#aaa] rounded-sm mb-8 font-mono tracking-widest uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></span>
                    PLATFORM ARCHITECT
                </div>

                <h2 className="text-3xl md:text-5xl font-bold font-sans tracking-tight text-white mb-4 uppercase flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                    <span>Project By</span>
                    <span className="text-accent-400 font-serif italic">Devansh Behl</span>
                </h2>

                <p className="max-w-xl text-[#888] font-mono text-xs md:text-sm leading-relaxed mb-10">
                    Engineered from the ground up to redefine how universities, companies, and students interact during the campus placement season. Built with React 19, TypeScript, and TailwindCSS v4.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                    <a 
                        href="https://github.com/DevanshBehl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#111] hover:bg-white text-[#aaa] hover:text-black border border-[#333] hover:border-white px-6 py-3 rounded-sm font-mono text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 duration-200"
                    >
                        <Github size={16} /> GitHub Profile
                    </a>
                    <a 
                        href="#" 
                        className="flex items-center gap-2 bg-transparent hover:bg-[#111] text-accent-400 border border-accent-500/30 hover:border-accent-500 px-6 py-3 rounded-sm font-mono text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 duration-200"
                    >
                        <Linkedin size={16} /> Connect
                    </a>
                </div>
            </motion.div>
        </section>
    );
}
