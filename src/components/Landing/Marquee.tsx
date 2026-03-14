export default function Marquee() {
    return (
        <div className="w-full overflow-hidden border-b border-[#333] bg-[#050505] py-2 flex">
            <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] flex gap-4 text-[#888] font-mono">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="px-4 font-bold text-xs uppercase tracking-widest text-[#555]">
                        DSA PREP · AI MOCKS · LIVE IDE · SYSTEM ARCHITECTURE WHITEBOARD · HR REPORTS
                    </span>
                ))}
            </div>
        </div>
    )
}
