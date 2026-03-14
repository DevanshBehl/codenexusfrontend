import { Link } from 'react-router-dom';

export default function FinalCTA() {
    return (
        <section className="py-32 px-6 flex flex-col items-center justify-center text-center bg-[#050505] min-h-[70vh] relative overflow-hidden">

            <div className="mb-10 text-[120px] leading-none font-bold text-accent-600 italic font-serif opacity-90 drop-shadow-[0_0_40px_oklch(0.777_0.152_181.912_/_0.3)] select-none">
                {'<'}cn/{'>'}
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase font-sans tracking-tight">YOU SHOWCASE THE SKILLS</h2>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-12 uppercase font-sans tracking-tight">WE PROVIDE THE PLATFORM</h2>

            <div className="flex gap-4 mb-32 z-10 font-mono">
                <Link to="/signup" className="bg-[#e0e0e0] text-black px-8 py-3 font-bold hover:bg-white transition-colors text-sm hover:scale-105 transform duration-200">
                    Student Sign Up
                </Link>
                <Link to="/login" className="bg-transparent text-white border border-[#555] px-8 py-3 font-bold hover:bg-[#111] transition-colors text-sm hover:scale-105 transform duration-200">
                    University & HR Login
                </Link>
            </div>

            <div className="w-full flex flex-col md:flex-row items-center justify-between pt-10 border-t border-[#333] border-dashed mt-auto font-mono z-10">
                <div className="flex flex-col items-start mb-6 md:mb-0">
                    <span className="text-xl font-bold text-white mb-2">codenexus</span>
                    <span className="text-[10px] text-accent-500 tracking-widest uppercase">© 2025 codenexus - All Rights Reserved</span>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-6 text-white mb-4 font-bold text-sm">
                        <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">GH</span>
                        <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">X</span>
                        <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">IG</span>
                        <span className="border-b-2 border-white pb-0.5 tracking-wider cursor-pointer hover:text-accent-400 hover:border-accent-400 transition-colors">EM</span>
                    </div>
                    <div className="border border-[#333] px-3 py-1 bg-[#111] flex items-center gap-2 text-[10px] text-[#888] mb-3 rounded-sm tracking-widest uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div> All systems operational
                    </div>
                    <div className="flex gap-4 text-[10px] text-[#555] tracking-widest uppercase">
                        <span className="hover:text-[#888] cursor-pointer">PRIVACY POLICY</span>
                        <span className="hover:text-[#888] cursor-pointer">//</span>
                        <span className="hover:text-[#888] cursor-pointer">TERMS OF SERVICE</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
