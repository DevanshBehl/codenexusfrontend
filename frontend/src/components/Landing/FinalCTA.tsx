import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

export default function FinalCTA() {
    const socialLinks = [
        { icon: <Github size={16} />, label: 'GH', href: '#' },
        { icon: <Twitter size={16} />, label: 'X', href: '#' },
        { icon: <Instagram size={16} />, label: 'IG', href: '#' },
        { icon: <Mail size={16} />, label: 'EM', href: '#' },
    ];

    return (
        <section className="py-32 px-6 flex flex-col items-center justify-center text-center bg-[#050505] min-h-[70vh] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-accent-500/[0.04] blur-[150px] pointer-events-none" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="mb-10 text-[120px] leading-none font-bold text-accent-600 italic font-serif drop-shadow-[0_0_40px_oklch(0.777_0.152_181.912_/_0.3)] select-none"
            >
                <motion.span
                    animate={{ textShadow: ['0 0 30px oklch(0.777 0.152 181.912 / 0.2)', '0 0 60px oklch(0.777 0.152 181.912 / 0.4)', '0 0 30px oklch(0.777 0.152 181.912 / 0.2)'] }}
                    transition={{ duration: 4, repeat: Infinity }}
                >
                    {'<'}cn/{'>'}
                </motion.span>
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase font-sans tracking-tight"
            >
                YOU SHOWCASE THE SKILLS
            </motion.h2>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-5xl font-bold text-white mb-12 uppercase font-sans tracking-tight"
            >
                WE PROVIDE THE PLATFORM
            </motion.h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex gap-4 mb-32 z-10 font-mono"
            >
                <Link to="/signup">
                    <motion.button
                        whileHover={{ scale: 1.07, boxShadow: '0 0 25px rgba(255,255,255,0.15)' }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-[#e0e0e0] text-black px-8 py-3 font-bold hover:bg-white transition-colors text-sm"
                    >
                        Student Sign Up
                    </motion.button>
                </Link>
                <Link to="/login">
                    <motion.button
                        whileHover={{ scale: 1.07, borderColor: 'oklch(0.777 0.152 181.912)' }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-transparent text-white border border-[#555] px-8 py-3 font-bold hover:bg-[#111] transition-all text-sm"
                    >
                        University & HR Login
                    </motion.button>
                </Link>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full flex flex-col md:flex-row items-center justify-between pt-10 border-t border-[#333] border-dashed mt-auto font-mono z-10"
            >
                <div className="flex flex-col items-start mb-6 md:mb-0">
                    <span className="text-xl font-bold text-white mb-2">codenexus</span>
                    <span className="text-[10px] text-accent-500 tracking-widest uppercase">© 2025 codenexus - All Rights Reserved</span>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-4 text-white mb-4">
                        {socialLinks.map((social, i) => (
                            <motion.a
                                key={i}
                                href={social.href}
                                whileHover={{ scale: 1.2, y: -2, color: 'oklch(0.777 0.152 181.912)' }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 border border-[#333] rounded-sm bg-[#111] hover:border-accent-500/50 transition-colors cursor-pointer"
                            >
                                {social.icon}
                            </motion.a>
                        ))}
                    </div>
                    <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="border border-[#333] px-3 py-1 bg-[#111] flex items-center gap-2 text-[10px] text-[#888] mb-3 rounded-sm tracking-widest uppercase"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]" /> All systems operational
                    </motion.div>
                    <div className="flex gap-4 text-[10px] text-[#555] tracking-widest uppercase">
                        <span className="hover:text-[#888] cursor-pointer transition-colors">PRIVACY POLICY</span>
                        <span>//</span>
                        <span className="hover:text-[#888] cursor-pointer transition-colors">TERMS OF SERVICE</span>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
