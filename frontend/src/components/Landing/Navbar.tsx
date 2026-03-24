import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { label: 'CodeNexus', to: '/', isActive: true },
        { label: 'For Students', href: '#prep' },
        { label: 'For HR & Universities', href: '#hiring' },
        { label: 'About Developer', to: '/about-developer' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full border-b border-[#333] flex items-center justify-between px-6 py-4 sticky top-0 z-50 transition-all duration-300 ${
                    scrolled ? 'bg-[#050505]/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]' : 'bg-[#050505]/80 backdrop-blur-md'
                }`}
            >
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif group">
                        <motion.span whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}>
                            {'<'}cn/{'>'}
                        </motion.span>
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
                        {navLinks.map((link) =>
                            link.to ? (
                                <Link key={link.label} to={link.to} className={`relative group py-1 transition-colors duration-200 ${link.isActive ? 'text-white' : 'hover:text-white'}`}>
                                    {link.label}
                                    {link.isActive && <motion.div layoutId="navIndicator" className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-accent-500" />}
                                    {!link.isActive && <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-accent-500/50 group-hover:w-full transition-all duration-300" />}
                                </Link>
                            ) : (
                                <a key={link.label} href={link.href} className="relative group py-1 hover:text-white transition-colors duration-200">
                                    {link.label}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-accent-500/50 group-hover:w-full transition-all duration-300" />
                                </a>
                            )
                        )}
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4 text-sm font-mono">
                    <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-[#888] tracking-wider text-xs"
                    >
                        start your interview prep!
                    </motion.span>
                    <Link to="/signup">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(255,255,255,0.15)' }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-[#e0e0e0] text-black px-4 py-1.5 font-bold hover:bg-white transition-colors"
                        >
                            Get Access
                        </motion.button>
                    </Link>
                </div>

                {/* Mobile hamburger */}
                <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </motion.nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed top-[65px] left-0 right-0 z-40 bg-[#0A0A0A] border-b border-[#333] overflow-hidden"
                    >
                        <div className="flex flex-col px-6 py-4 gap-3">
                            {navLinks.map((link) =>
                                link.to ? (
                                    <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="text-sm text-[#aaa] hover:text-white py-2 border-b border-[#222] transition-colors">
                                        {link.label}
                                    </Link>
                                ) : (
                                    <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="text-sm text-[#aaa] hover:text-white py-2 border-b border-[#222] transition-colors">
                                        {link.label}
                                    </a>
                                )
                            )}
                            <Link to="/signup" onClick={() => setMobileOpen(false)} className="bg-[#e0e0e0] text-black px-4 py-2 font-bold text-sm text-center mt-2">
                                Get Access
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
