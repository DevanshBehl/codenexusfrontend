import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
    Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff,
    Hand, MessageSquare, Users, Send, Settings, MoreVertical,
    User, ChevronLeft, Volume2, Maximize, Check, XCircle
} from 'lucide-react';
import { webinarApi, type WebinarItem, type WebinarMessage } from '../../lib/api';

export type WebinarRole = 'COMPANY' | 'STUDENT';

interface ChatMessage {
    id: string;
    sender: string;
    role: WebinarRole;
    text: string;
    timestamp: string;
    isQuestion?: boolean;
}

interface Participant {
    id: string;
    odotuserId: string;
    name: string;
    role: WebinarRole;
    isMicOn: boolean;
    isVideoOn: boolean;
    handRaised: boolean;
    permissionGranted: boolean;
}

interface WebinarRoomProps {
    userRole: WebinarRole;
}

export default function WebinarRoom({ userRole }: WebinarRoomProps) {
    const { id: webinarId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const socketRef = useRef<Socket | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    
    // Webinar State
    const [webinar, setWebinar] = useState<WebinarItem | null>(null);
    const [myRole, setMyRole] = useState<WebinarRole>(userRole);
    const [myUserId, setMyUserId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [joined, setJoined] = useState(false);
    
    // UI State
    const [activeSidebarTab, setActiveSidebarTab] = useState<'CHAT' | 'PARTICIPANTS'>('CHAT');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Media State
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    
    // Room Data State
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');

    // Socket event handlers
    const handlePeerJoined = useCallback((data: { userId: string; userName: string; role: string }) => {
        setParticipants(prev => {
            if (prev.some(p => p.odotuserId === data.userId)) return prev;
            return [...prev, {
                id: data.userId,
                odotuserId: data.userId,
                name: data.userName,
                role: data.role as WebinarRole,
                isMicOn: false,
                isVideoOn: false,
                handRaised: false,
                permissionGranted: false
            }];
        });
    }, []);

    const handlePeerLeft = useCallback((data: { userId: string }) => {
        setParticipants(prev => prev.filter(p => p.odotuserId !== data.userId));
    }, []);

    const handleHandRaised = useCallback((data: { userId: string; userName: string }) => {
        setParticipants(prev => prev.map(p =>
            p.odotuserId === data.userId ? { ...p, handRaised: true } : p
        ));
    }, []);

    const handleHandLowered = useCallback((data: { userId: string }) => {
        setParticipants(prev => prev.map(p =>
            p.odotuserId === data.userId ? { ...p, handRaised: false } : p
        ));
    }, []);

    const handlePermissionGranted = useCallback((data: { userId: string }) => {
        setParticipants(prev => prev.map(p =>
            p.odotuserId === data.userId ? { ...p, permissionGranted: true, handRaised: false } : p
        ));
    }, []);

    const handlePermissionRevoked = useCallback((data: { userId: string }) => {
        setParticipants(prev => prev.map(p =>
            p.odotuserId === data.userId ? { ...p, permissionGranted: false, isMicOn: false, isVideoOn: false } : p
        ));
    }, []);

    const handleChatMessage = useCallback((data: ChatMessage) => {
        setChat(prev => [...prev, data]);
    }, []);

    const handleWebinarEnded = useCallback(() => {
        setJoined(false);
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }
        setTimeout(() => navigate(-1), 3000);
    }, [localStream, remoteStream, navigate]);

    const handleNewProducer = useCallback(async (data: { producerId: string; userId: string }) => {
        if (!socketRef.current) return;
        
        try {
            const transport = await createTransport();
            const { producerId } = data;
            
            socketRef.current.emit("consume-webinar", {
                webinarId,
                transportId: transport.id,
                producerId,
                rtpCapabilities: (window as any).__mediasoupRouter?.rtpCapabilities
            }, async (response: any) => {
                if (response.error) {
                    console.error("Consume error:", response.error);
                    return;
                }
                
                const stream = new MediaStream();
                // The actual track handling would need more implementation
                setRemoteStream(stream);
            });
        } catch (err) {
            console.error("Failed to consume new producer:", err);
        }
    }, [webinarId, myRole]);

    const createTransport = async () => {
        if (!socketRef.current) throw new Error("Socket not connected");

        return new Promise<any>((resolve, reject) => {
            socketRef.current!.emit("createWebRtcTransport", { interviewId: `webinar-${webinarId}` }, (response: any) => {
                if (response.error) reject(new Error(response.error));
                else resolve(response);
            });
        });
    };

    const enableMedia = async (kind: 'audio' | 'video') => {
        try {
            const constraints = kind === 'audio'
                ? { audio: true }
                : { video: { width: 1280, height: 720 } };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (kind === 'audio') {
                if (localStream) {
                    stream.getAudioTracks().forEach(track => localStream.addTrack(track));
                } else {
                    setLocalStream(stream);
                }
            } else {
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                if (localStream) {
                    stream.getVideoTracks().forEach(track => localStream.addTrack(track));
                } else {
                    setLocalStream(stream);
                }
            }
            
            return stream;
        } catch (err) {
            console.error(`Failed to get ${kind} media:`, err);
            throw err;
        }
    };

    const disableMedia = (kind: 'audio' | 'video') => {
        if (localStream) {
            localStream.getTracks().forEach(track => {
                if (track.kind === kind) track.stop();
            });
        }
        if (kind === 'video' && localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
    };

    // Socket initialization
    useEffect(() => {
        if (!webinarId) return;

        const token = localStorage.getItem('cn_token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setMyUserId(payload.id || payload.userId || '');
        } catch { /* ignore parse errors */ }

        const socket = io(window.location.origin, {
            path: '/socket.io',
            auth: { token },
            transports: ['websocket', 'polling']
        });
        socketRef.current = socket;

        socket.on('connect', async () => {
            console.log('[WebinarSocket] Connected');
            
            try {
                const res = await webinarApi.getById(webinarId);
                setWebinar(res.data);
                
                const webinarDetail = await new Promise<any>((resolve, reject) => {
                    socket.emit("join-webinar", { webinarId }, (response: any) => {
                        if (response.error) reject(new Error(response.error));
                        else resolve(response);
                    });
                });
                
                setMyRole(webinarDetail.role === 'PRESENTER' ? 'COMPANY' : 'STUDENT');
                setJoined(true);
                setLoading(false);
                
                // Set initial participants from callback
                if (webinarDetail.attendees) {
                    setParticipants(webinarDetail.attendees.map((a: any) => ({
                        id: a.userId,
                        odotuserId: a.userId,
                        name: 'Attendee',
                        role: a.role === 'PRESENTER' ? 'COMPANY' : 'STUDENT',
                        isMicOn: false,
                        isVideoOn: false,
                        handRaised: false,
                        permissionGranted: a.hasPermissionToSpeak
                    })));
                }
                
                // Load chat history
                const messagesRes = await webinarApi.getMessages(webinarId);
                setChat(messagesRes.data.map((m: any) => ({
                    id: m.id,
                    sender: m.senderName,
                    role: 'STUDENT' as WebinarRole,
                    text: m.content,
                    timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isQuestion: m.isQuestion
                })));
                
                // Get router capabilities for later media production
                const { rtpCapabilities } = await new Promise<any>((resolve, reject) => {
                    socket.emit("getRouterRtpCapabilities", { interviewId: `webinar-${webinarId}` }, (response: any) => {
                        if (response.error) reject(new Error(response.error));
                        else resolve(response);
                    });
                });
                (window as any).__mediasoupRouter = { rtpCapabilities };
                
            } catch (err) {
                console.error('[WebinarSocket] Failed to join webinar:', err);
                setLoading(false);
            }
        });

        // Webinar-specific events
        socket.on('webinar-peer-joined', handlePeerJoined);
        socket.on('webinar-peer-left', handlePeerLeft);
        socket.on('hand-raised', handleHandRaised);
        socket.on('hand-lowered', handleHandLowered);
        socket.on('permission-granted', handlePermissionGranted);
        socket.on('permission-revoked', handlePermissionRevoked);
        socket.on('webinar-chat-message', handleChatMessage);
        socket.on('webinar-ended', handleWebinarEnded);
        socket.on('new-webinar-producer', handleNewProducer);

        socket.on('error', (data: any) => {
            console.error('[WebinarSocket] Error:', data.message);
        });

        socket.on('disconnect', () => {
            console.log('[WebinarSocket] Disconnected');
        });

        return () => {
            if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach(track => track.stop());
            }
            socket.emit("leave-webinar", { webinarId });
            socket.disconnect();
            socketRef.current = null;
        };
    }, [webinarId, navigate]);

    const hasPermissionToSpeak = myRole === 'COMPANY' || participants.find(p => p.odotuserId === myUserId)?.permissionGranted === true;

    const handleToggleMic = async () => {
        if (!hasPermissionToSpeak) return;
        
        if (isMicOn) {
            disableMedia('audio');
            setIsMicOn(false);
        } else {
            try {
                await enableMedia('audio');
                setIsMicOn(true);
                
                // Produce audio
                if (socketRef.current) {
                    const transport = await createTransport();
                    await new Promise<void>((resolve, reject) => {
                        socketRef.current!.emit("connectWebRtcTransport", { transportId: transport.id, dtlsParameters: transport.dtlsParameters }, (response: any) => {
                            if (response.error) reject(new Error(response.error));
                            else resolve();
                        });
                    });
                    
                    localStream?.getAudioTracks().forEach(track => {
                        socketRef.current!.emit("produce-webinar", {
                            webinarId,
                            transportId: transport.id,
                            kind: 'audio',
                            rtpParameters: { track }
                        }, (response: any) => {
                            if (response.error) console.error("Produce audio error:", response.error);
                        });
                    });
                }
            } catch (err) {
                console.error("Failed to enable mic:", err);
            }
        }
    };

    const handleToggleVideo = async () => {
        if (!hasPermissionToSpeak) return;
        
        if (isVideoOn) {
            disableMedia('video');
            setIsVideoOn(false);
        } else {
            try {
                await enableMedia('video');
                setIsVideoOn(true);
                
                // Produce video
                if (socketRef.current) {
                    const transport = await createTransport();
                    await new Promise<void>((resolve, reject) => {
                        socketRef.current!.emit("connectWebRtcTransport", { transportId: transport.id, dtlsParameters: transport.dtlsParameters }, (response: any) => {
                            if (response.error) reject(new Error(response.error));
                            else resolve();
                        });
                    });
                    
                    localStream?.getVideoTracks().forEach(track => {
                        socketRef.current!.emit("produce-webinar", {
                            webinarId,
                            transportId: transport.id,
                            kind: 'video',
                            rtpParameters: { track }
                        }, (response: any) => {
                            if (response.error) console.error("Produce video error:", response.error);
                        });
                    });
                }
            } catch (err) {
                console.error("Failed to enable video:", err);
            }
        }
    };

    const handleToggleScreenShare = async () => {
        if (myRole !== 'COMPANY') return;

        if (isScreenSharing) {
            if (localStream) {
                localStream.getVideoTracks().forEach(track => {
                    if (track.label.toLowerCase().includes('screen') || track.label.toLowerCase().includes('display')) {
                        track.stop();
                    }
                });
            }
            setIsScreenSharing(false);
        } else {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                const screenTrack = screenStream.getVideoTracks()[0];
                screenTrack.onended = () => setIsScreenSharing(false);

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }
                setIsScreenSharing(true);

                if (socketRef.current) {
                    socketRef.current.emit("produce-webinar", {
                        webinarId,
                        transportId: (socketRef.current as any).__sendTransportId,
                        kind: 'video',
                        rtpParameters: {}
                    }, (response: any) => {
                        if (response.error) console.error("Produce screen error:", response.error);
                    });
                }
            } catch (err) {
                console.error("Failed to start screen sharing:", err);
            }
        }
    };

    const handleRaiseHand = () => {
        if (myRole === 'COMPANY') return;
        setIsHandRaised(!isHandRaised);
        socketRef.current?.emit(isHandRaised ? "lower-hand" : "raise-hand", { webinarId });
    };

    const handleGrantPermission = (userId: string) => {
        socketRef.current?.emit("grant-permission", { webinarId, targetUserId: userId }, (response: any) => {
            if (response.error) console.error("Grant permission error:", response.error);
        });
    };

    const handleRevokePermission = (userId: string) => {
        socketRef.current?.emit("revoke-permission", { webinarId, targetUserId: userId }, (response: any) => {
            if (response.error) console.error("Revoke permission error:", response.error);
        });
    };

    const handleSendChat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !socketRef.current) return;

        socketRef.current.emit("webinar-chat-message", { webinarId, text: chatInput });
        setChatInput('');
    };

    const handleEndWebinar = () => {
        socketRef.current?.emit("end-webinar", { webinarId }, (response: any) => {
            if (response.error) console.error("End webinar error:", response.error);
        });
    };

    const handleLeaveCall = () => {
        socketRef.current?.emit("leave-webinar", { webinarId });
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
                <div className="text-[#555] font-mono text-xs uppercase tracking-widest">Joining webinar...</div>
            </div>
        );
    }

    if (!joined) {
        return (
            <div className="h-screen w-full bg-[#050505] flex items-center justify-center flex-col gap-4">
                <div className="text-red-400 font-mono text-sm">Failed to join webinar</div>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#111] border border-[#333] text-white text-xs font-mono">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-[#050505] flex flex-col font-sans text-white overflow-hidden relative">
            {/* Topbar */}
            <header className="h-14 bg-[#0A0A0A] border-b border-[#222] flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
                <div className="flex items-center gap-4 border-r border-[#222] pr-6">
                    <button 
                        onClick={handleLeaveCall}
                        className="text-[#888] hover:text-white transition-colors p-1 bg-[#111] border border-[#333] rounded-sm"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 text-accent-500 font-bold italic font-serif opacity-50 pointer-events-none">
                        <span>{'<'}</span>cn/<span>{'>'}</span>
                    </div>
                </div>
                
                <div className="flex-1 px-6 flex items-center gap-4">
                    <div className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span> LIVE
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-widest uppercase">{webinar?.title || 'Webinar'}</h1>
                        <p className="text-[10px] font-mono text-[#888]">{myRole === 'COMPANY' ? 'Presenting' : 'Attending'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-[#888] hover:text-white transition-colors" title="Audio Settings"><Volume2 size={16}/></button>
                    <button className="text-[#888] hover:text-white transition-colors" title="Fullscreen"><Maximize size={16}/></button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Stages Area (Video View) */}
                <main className="flex-1 p-4 md:p-6 flex flex-col items-center justify-center bg-[#050505] relative z-10">
                    <div className="w-full max-w-6xl h-full flex flex-col gap-4">
                        
                        {/* Primary Presenter Stage */}
                        <div className="flex-1 bg-[#0A0A0A] border rounded-sm border-[#222] relative overflow-hidden group shadow-2xl flex flex-col">
                            {myRole === 'COMPANY' ? (
                                <>
                                    {isScreenSharing ? (
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0A0A0A] flex flex-col items-center justify-center">
                                            <MonitorUp size={64} className="text-accent-500/20 mb-4" />
                                            <h2 className="text-xl font-mono text-accent-500 uppercase tracking-widest font-bold">Screen Sharing Active</h2>
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                ref={localVideoRef}
                                                autoPlay
                                                muted
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                            {!isVideoOn && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#111] to-[#0A0A0A]">
                                                    <div className="w-32 h-32 rounded-full border border-[#333] bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-inner">
                                                        <User size={48} className="text-[#555]" />
                                                    </div>
                                                    <h2 className="text-2xl font-bold text-white tracking-tight">{webinar?.company.name} Presenter</h2>
                                                    <p className="text-sm text-[#888] mt-2 font-mono uppercase tracking-widest">Camera Off</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    <video
                                        ref={remoteVideoRef}
                                        autoPlay
                                                playsInline
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                    {remoteStream ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-32 h-32 rounded-full border border-[#333] bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-inner">
                                                <User size={48} className="text-[#555]" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight">{webinar?.company.name} Presenter</h2>
                                            <p className="text-sm text-[#888] mt-2 font-mono uppercase tracking-widest">Live Stream</p>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="w-32 h-32 rounded-full border border-[#333] bg-[#1a1a1a] flex items-center justify-center mb-6 shadow-inner">
                                                <User size={48} className="text-[#555]" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white tracking-tight">Waiting for presenter...</h2>
                                            <p className="text-sm text-[#888] mt-2 font-mono uppercase tracking-widest">Stream will begin shortly</p>
                                        </div>
                                    )}
                                </>
                            )}
                            
                            {/* Video Controls Overlay */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10 flex items-center gap-2">
                                {isScreenSharing && <MonitorUp size={12} className="text-accent-500" />}
                                <span className="text-[10px] font-mono text-white tracking-widest">{isScreenSharing ? 'Screen Share' : (myRole === 'COMPANY' ? 'Your Camera' : 'Presenter Stream')}</span>
                            </div>
                        </div>
                        
                        {/* Secondary Viewers Stage (Students with permission) */}
                        <div className="h-32 shrink-0 flex gap-4 overflow-x-auto custom-scrollbar">
                            {participants.filter(p => p.role !== 'COMPANY' && p.permissionGranted).map(p => (
                                <div key={p.id} className="w-48 h-full bg-[#0A0A0A] border border-[#222] rounded-sm relative overflow-hidden flex items-center justify-center">
                                    <User size={24} className="text-[#444]" />
                                    <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded-sm border border-white/10 flex items-center gap-2">
                                        <span className="text-[9px] font-mono text-white truncate max-w-[100px]">{p.name}</span>
                                        {p.isMicOn ? <Mic size={10} className="text-green-400" /> : <MicOff size={10} className="text-red-400" />}
                                    </div>
                                </div>
                            ))}
                            {[1, 2, 3].map(i => (
                                <div key={`empty-${i}`} className="w-48 h-full bg-[#0A0A0A]/50 border border-[#222] border-dashed rounded-sm flex items-center justify-center opacity-30">
                                    <User size={24} className="text-[#333]" />
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar (Chat & Participants) */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 340, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full bg-[#0A0A0A] border-l border-[#222] flex flex-col shrink-0 z-20"
                        >
                            {/* Tabs */}
                            <div className="flex border-b border-[#222]">
                                <button 
                                    onClick={() => setActiveSidebarTab('CHAT')}
                                    className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest font-bold transition-colors border-b-2 flex items-center justify-center gap-2
                                        ${activeSidebarTab === 'CHAT' ? 'text-accent-400 border-accent-500 bg-[#111]' : 'text-[#888] border-transparent hover:bg-[#111] hover:text-white'}`}
                                >
                                    <MessageSquare size={14} /> Chat
                                </button>
                                <button 
                                    onClick={() => setActiveSidebarTab('PARTICIPANTS')}
                                    className={`flex-1 py-4 text-xs font-mono uppercase tracking-widest font-bold transition-colors border-b-2 flex items-center justify-center gap-2
                                        ${activeSidebarTab === 'PARTICIPANTS' ? 'text-accent-400 border-accent-500 bg-[#111]' : 'text-[#888] border-transparent hover:bg-[#111] hover:text-white'}`}
                                >
                                    <Users size={14} /> People ({participants.length})
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="flex-1 overflow-hidden relative">
                                
                                {/* --- CHAT TAB --- */}
                                {activeSidebarTab === 'CHAT' && (
                                    <div className="absolute inset-0 flex flex-col">
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                                            {chat.map(msg => (
                                                <div key={msg.id} className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-xs font-bold ${msg.role === 'COMPANY' ? 'text-accent-400' : 'text-white'}`}>
                                                            {msg.sender}
                                                        </span>
                                                        {msg.isQuestion && <span className="text-[9px] font-mono text-yellow-400 bg-yellow-500/10 px-1 py-0.5 rounded-sm">Q</span>}
                                                        <span className="text-[9px] font-mono text-[#666]">{msg.timestamp}</span>
                                                    </div>
                                                    <div className="text-sm text-[#ccc] leading-relaxed break-words bg-[#111] p-3 rounded-sm border border-[#222]">
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={handleSendChat} className="p-4 border-t border-[#222] bg-[#111] flex gap-2">
                                            <input 
                                                type="text" 
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Type message to everyone..."
                                                className="flex-1 bg-[#1a1a1a] border border-[#333] outline-none px-3 py-2 text-sm font-sans text-white placeholder:text-[#555] rounded-sm focus:border-accent-500 transition-colors"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!chatInput.trim()}
                                                className="bg-accent-500 text-black p-2 rounded-sm disabled:opacity-50 hover:bg-accent-400 transition-colors shrink-0"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* --- PARTICIPANTS TAB --- */}
                                {activeSidebarTab === 'PARTICIPANTS' && (
                                    <div className="absolute inset-0 flex flex-col overflow-y-auto custom-scrollbar p-4 gap-2">
                                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-2 mb-1 pl-1 border-b border-[#222] pb-1">Presenter</div>
                                        {participants.filter(p => p.role === 'COMPANY').map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-[#111] border border-[#222] p-3 rounded-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center font-bold text-xs">C</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{p.name}</p>
                                                        <p className="text-[9px] font-mono text-[#888] uppercase">Host</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {p.isMicOn ? <Mic size={14} className="text-green-400"/> : <MicOff size={14} className="text-red-400"/>}
                                                    {p.isVideoOn ? <Video size={14} className="text-green-400"/> : <VideoOff size={14} className="text-red-400"/>}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="text-[10px] font-mono text-[#555] uppercase tracking-widest mt-6 mb-1 pl-1 border-b border-[#222] pb-1">Viewers</div>
                                        {participants.filter(p => p.role === 'STUDENT').map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-[#111] border border-[#222] p-3 rounded-sm group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-[#222] text-[#888] flex items-center justify-center shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate pr-2">{p.name}</p>
                                                        <div className="flex gap-1 mt-0.5">
                                                            {p.handRaised && <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[8px] px-1 py-0.5 uppercase tracking-wider rounded-sm font-mono flex items-center gap-1"><Hand size={8}/> Raised</span>}
                                                            {p.permissionGranted && <span className="bg-green-500/10 text-green-500 border border-green-500/20 text-[8px] px-1 py-0.5 uppercase tracking-wider rounded-sm font-mono">Speaker</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <div className="flex gap-2">
                                                        {p.isMicOn ? <Mic size={14} className="text-green-400"/> : <MicOff size={14} className="text-[#444]"/>}
                                                    </div>
                                                    
                                                    {myRole === 'COMPANY' && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2 border-l border-[#333] pl-2">
                                                            {!p.permissionGranted ? (
                                                                <button onClick={() => handleGrantPermission(p.odotuserId)} title="Grant Mic/Cam Access" className="p-1 text-[#888] hover:text-green-400 hover:bg-[#222] rounded-sm transition-colors">
                                                                    <Check size={14} />
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleRevokePermission(p.odotuserId)} title="Revoke Access" className="p-1 text-[#888] hover:text-red-400 hover:bg-[#222] rounded-sm transition-colors">
                                                                    <XCircle size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Dock Control Bar */}
            <div className="h-20 bg-[#0A0A0A] border-t border-[#222] shrink-0 z-30 flex items-center justify-between px-6 lg:px-12 shadow-2xl relative">
                
                {/* Left Side Info */}
                <div className="hidden lg:flex flex-col gap-1 w-64">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888]">{myRole === 'COMPANY' ? 'PRESENTER' : 'VIEWER'} MODE</span>
                    {myRole === 'STUDENT' && !hasPermissionToSpeak && (
                        <span className="text-[9px] text-red-400 font-mono tracking-wider">Audio/Video Disabled by Host</span>
                    )}
                </div>

                {/* Center Core Controls */}
                <div className="flex-1 flex justify-center items-center gap-3 md:gap-4">
                    
                    {/* Mic Button */}
                    <button 
                        onClick={handleToggleMic}
                        disabled={!hasPermissionToSpeak}
                        title={!hasPermissionToSpeak ? "Mic disabled by host" : (isMicOn ? "Turn Off Mic" : "Turn On Mic")}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                            !hasPermissionToSpeak 
                                ? 'bg-[#111] text-[#333] border border-[#222] cursor-not-allowed'
                                : (isMicOn 
                                    ? 'bg-[#222] text-white hover:bg-[#333] border border-[#444]' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                )
                        }`}
                    >
                        {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    {/* Camera Button */}
                    <button 
                        onClick={handleToggleVideo}
                        disabled={!hasPermissionToSpeak}
                        title={!hasPermissionToSpeak ? "Camera disabled by host" : (isVideoOn ? "Turn Off Camera" : "Turn On Camera")}
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                            !hasPermissionToSpeak 
                                ? 'bg-[#111] text-[#333] border border-[#222] cursor-not-allowed'
                                : (isVideoOn 
                                    ? 'bg-[#222] text-white hover:bg-[#333] border border-[#444]' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                )
                        }`}
                    >
                        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    {/* Screen Share (Company Only) */}
                    {myRole === 'COMPANY' && (
                        <button
                            onClick={handleToggleScreenShare}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border ${
                                isScreenSharing 
                                    ? 'bg-accent-500 text-black border-accent-400 hover:bg-accent-400 shadow-[0_0_15px_rgba(var(--accent-500),0.3)]' 
                                    : 'bg-[#222] text-white border-[#444] hover:bg-[#333]'
                            }`}
                        >
                            <MonitorUp size={20} />
                        </button>
                    )}

                    {/* Raise Hand (Student Only) */}
                    {myRole === 'STUDENT' && (
                        <button 
                            onClick={handleRaiseHand}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all border ${
                                isHandRaised 
                                    ? 'bg-yellow-500 text-black border-yellow-400 hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                                    : 'bg-[#222] text-white border-[#444] hover:bg-[#333]'
                            }`}
                        >
                            <Hand size={20} />
                        </button>
                    )}

                    {/* End Call / Leave Button */}
                    <button 
                        onClick={myRole === 'COMPANY' ? handleEndWebinar : handleLeaveCall}
                        className="w-16 h-12 md:w-20 md:h-14 rounded-3xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.2)] ml-4 border border-red-400"
                    >
                        <PhoneOff size={20} />
                    </button>
                </div>

                {/* Right Side Options */}
                <div className="hidden lg:flex justify-end gap-3 w-64">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
                            isSidebarOpen ? 'bg-accent-500/20 text-accent-400 border-accent-500/30' : 'bg-[#111] text-[#888] border-[#333] hover:text-white hover:bg-[#222]'
                        }`}
                    >
                        <MessageSquare size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] text-[#888] border border-[#333] hover:text-white hover:bg-[#222] transition-colors">
                        <Settings size={16} />
                    </button>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] text-[#888] border border-[#333] hover:text-white hover:bg-[#222] transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Global Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 0px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}} />
        </div>
    );
}