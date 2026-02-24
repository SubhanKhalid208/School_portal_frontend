import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { toast } from 'react-hot-toast';

const ChatBox = ({ roomId, userId, userName, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [whoIsTyping, setWhoIsTyping] = useState("");
    const scrollRef = useRef();

    // ✅ MUHAMMAD AHMED: History Load Logic (Enhanced handling)
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const response = await fetch(`${apiBase}/chat/history/GLOBAL_ROOM`);
                
                if (!response.ok) throw new Error(`Status: ${response.status}`);

                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            } catch (err) {
                console.error("History error:", err);
            }
        };
        fetchChatHistory();
    }, [roomId]);

    // ✅ Socket Connection Logic
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket'] 
        });
        
        setSocket(newSocket);
        newSocket.emit("join_room", "GLOBAL_ROOM");

        newSocket.off("receive_message").on("receive_message", (data) => {
            if (data.senderId !== userId) {
                setMessages((prev) => [...prev, data]);
                new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(() => {});
            }
        });

        newSocket.off("user_typing").on("user_typing", (data) => {
            if (data.status) {
                setIsTyping(true);
                setWhoIsTyping(data.userName || "Someone");
            } else {
                setIsTyping(false);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId]); 

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !socket) return;

        const messageData = {
            room: "GLOBAL_ROOM",
            senderId: userId,
            senderName: userName,
            message: newMessage, 
            role: userRole, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        try {
            setMessages((prev) => [...prev, messageData]);
            socket.emit("send_message", messageData);
            setNewMessage("");
            socket.emit("typing", { room: "GLOBAL_ROOM", status: false, userName });
        } catch (err) {
            toast.error("Message failed!");
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socket?.emit("typing", { 
            room: "GLOBAL_ROOM", 
            status: e.target.value.length > 0,
            userName: userName 
        });
    };

    // Helper for Avatars
    const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-[#0f172a] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl relative">
            
            {/* --- Header --- */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                            <span className="text-white font-black text-xl -rotate-3">LP</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#0f172a] rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg tracking-tight">Lahore <span className="text-green-500">Portal</span></h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Community Hub</span>
                        </div>
                    </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                    <div className="bg-green-500/10 px-4 py-1 rounded-full border border-green-500/20">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse">● Live Now</span>
                    </div>
                </div>
            </div>

            {/* --- Messages Area --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scroll-smooth custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                        <div className="w-20 h-20 border-2 border-dashed border-white rounded-full animate-spin-slow mb-4"></div>
                        <p className="text-xs uppercase font-black tracking-widest text-white">Starting Encryption...</p>
                    </div>
                )}
                
                {messages.map((msg, index) => {
                    const isMe = msg.senderId === userId;
                    const isTeacher = msg.role === 'teacher';

                    return (
                        <div key={index} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} items-end animate-fade-in-up`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg shrink-0 ${
                                isMe ? "bg-green-500 text-black" : isTeacher ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
                            }`}>
                                {getInitials(msg.senderName)}
                            </div>

                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                                {/* Name Tag */}
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mb-1 px-1">
                                    {msg.senderName} • {isTeacher ? '⭐ Faculty' : 'Student'}
                                </span>

                                {/* Bubble */}
                                <div className={`relative p-3.5 rounded-2xl text-sm leading-relaxed shadow-xl transition-all hover:brightness-110 ${
                                    isMe 
                                    ? "bg-gradient-to-br from-green-400 to-green-600 text-black font-medium rounded-tr-none" 
                                    : isTeacher 
                                        ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tl-none border border-blue-400/20"
                                        : "bg-white/10 text-white rounded-tl-none border border-white/10 backdrop-blur-md"
                                }`}>
                                    {msg.message}
                                    <div className={`absolute bottom-[-18px] whitespace-nowrap text-[8px] font-bold text-gray-600 ${isMe ? "right-0" : "left-0"}`}>
                                        {msg.time || "Just now"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {isTyping && (
                    <div className="flex items-center gap-3 ml-11 animate-pulse">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{whoIsTyping} typing...</span>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* --- Input Area --- */}
            <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-xl">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                    <input 
                        type="text" 
                        placeholder={`Hey Muhammad Ahmed, type a message...`} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-5 pr-14 text-sm focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-white placeholder:text-gray-600 shadow-inner"
                        value={newMessage}
                        onChange={handleTyping}
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="absolute right-2 p-2.5 bg-green-500 text-black rounded-lg hover:bg-green-400 active:scale-90 transition-all disabled:opacity-30 disabled:grayscale"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </form>
            </div>
            
            {/* Custom Styles for Scrollbar and Animation */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .animate-spin-slow { animation: spin 3s linear infinite; }
            `}</style>
        </div>
    );
};

export default ChatBox;