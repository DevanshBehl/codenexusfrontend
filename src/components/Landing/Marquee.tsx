export default function Marquee() {
    const items = 'DSA PREP · AI MOCKS · LIVE IDE · SYSTEM ARCHITECTURE WHITEBOARD · HR REPORTS · CODE ARENA · DESIGN ARENA · WEBINARS';

    return (
        <div className="w-full overflow-hidden border-b border-[#333] bg-[#050505] py-3 relative group">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

            <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused]">
                {[...Array(3)].map((_, i) => (
                    <span key={i} className="px-4 font-bold text-xs uppercase tracking-[0.25em] text-[#555] hover:text-accent-500/60 transition-colors duration-500 cursor-default">
                        {items} ·&nbsp;
                    </span>
                ))}
            </div>
        </div>
    );
}
