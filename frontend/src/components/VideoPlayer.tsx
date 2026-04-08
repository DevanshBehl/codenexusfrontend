import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string;
    title?: string;
    isLoading?: boolean;
}

export default function VideoPlayer({ isOpen, onClose, videoUrl, title = 'Recording Playback', isLoading = false }: VideoPlayerProps) {
    const defaultVideo = 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-5xl bg-[#0A0A0A] border border-[#333] rounded-md shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-[#222] bg-[#111]">
                            <h3 className="text-white font-sans font-bold text-lg">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-[#888] hover:text-white transition-colors bg-[#222] hover:bg-[#333] p-1.5 rounded-sm"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                            {isLoading ? (
                                <Loader2 size={48} className="text-accent-500 animate-spin" />
                            ) : (
                                <video
                                    className="w-full h-full object-contain"
                                    controls
                                    controlsList="nodownload"
                                    autoPlay
                                    src={videoUrl || defaultVideo}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
