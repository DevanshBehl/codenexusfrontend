import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav className="w-full border-b border-[#333] flex items-center justify-between px-6 py-4 bg-[#050505]/90 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-accent-500 font-bold text-xl italic font-serif">
                    <span>{'<'}cn/{'>'}</span>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-[#888]">
                    <a href="#" className="text-white border-b-2 border-accent-500 pb-1">CodeNexus</a>
                    <a href="#prep" className="hover:text-white transition-colors">For Students</a>
                    <a href="#hiring" className="hover:text-white transition-colors">For HR & Universities</a>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-sm font-mono">
                <span className="text-[#888] tracking-wider text-xs">start your interview prep!</span>
                <Link to="/signup" className="bg-[#e0e0e0] text-black px-4 py-1.5 font-bold hover:bg-white transition-colors">
                    Get Access
                </Link>
            </div>
        </nav>
    )
}
