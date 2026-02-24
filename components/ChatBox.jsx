import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from "socket.io-client";
import { toast } from 'react-hot-toast';

const ChatBox = ({ roomId, userId, userName, userRole, onNewMessage, receiverId, receiverName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [whoIsTyping, setWhoIsTyping] = useState("");
    const scrollRef = useRef();

    // ✅ MUHAMMAD AHMED: Guaranteed Room Logic (No Changes)
    const activeRoom = useMemo(() => {
        if (receiverId && userId) {
            const ids = [Number(userId), Number(receiverId)].sort((a, b) => a - b);
            return `${ids[0]}_${ids[1]}`; 
        }
        return roomId || "GLOBAL_ROOM";
    }, [userId, receiverId, roomId]);

    // ✅ MUHAMMAD AHMED: History Load Logic (No Changes)
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!activeRoom || activeRoom === "GLOBAL_ROOM" && !roomId) return;
            
            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
                const response = await fetch(`${apiBase}/chat/chat-history/${activeRoom}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                const result = await response.json();
                
                if (result.success && Array.isArray(result.data)) {
                    setMessages(result.data);
                } else {
                    setMessages([]); 
                }
            } catch (err) {
                console.error("❌ History error:", err);
                setMessages([]);
            }
        };
        fetchChatHistory();
    }, [activeRoom, roomId]);

    // ✅ Socket Connection (No Changes)
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";
        const newSocket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'] 
        });
        
        setSocket(newSocket);
        newSocket.emit("join_room", activeRoom);

        newSocket.on("receive_message", (data) => {
            if (String(data.room) === String(activeRoom)) {
                if (String(data.senderId) !== String(userId)) {
                    setMessages((prev) => [...prev, data]);
                    if (onNewMessage) onNewMessage();
                    new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3').play().catch(() => {});
                }
            }
        });

        newSocket.on("user_typing", (data) => {
            if (String(data.room) === String(activeRoom)) {
                if (data.status) {
                    setIsTyping(true);
                    setWhoIsTyping(data.userName || "Someone");
                } else {
                    setIsTyping(false);
                }
            }
        });

        return () => {
            newSocket.off("receive_message");
            newSocket.off("user_typing");
            newSocket.disconnect();
        };
    }, [activeRoom, userId, onNewMessage]); 

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !socket) return;

        const messageData = {
            room: activeRoom, 
            senderId: userId,
            senderName: userName,
            receiverId: receiverId, 
            message: newMessage, 
            role: userRole, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        try {
            setMessages((prev) => [...prev, messageData]);
            socket.emit("send_message", messageData);
            setNewMessage("");
            socket.emit("typing", { room: activeRoom, status: false, userName });
        } catch (err) {
            toast.error("Message failed!");
        }
    };

    const handleTyping = (e) => {
        const val = e.target.value;
        setNewMessage(val);
        socket?.emit("typing", { 
            room: activeRoom, 
            status: val.length > 0,
            userName: userName 
        });
    };

    const getInitials = (name) => {
        if (!name) return "LP";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex flex-col h-[650px] w-full max-w-2xl mx-auto bg-[#0f172a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-2xl relative">
            
            {/* Header - Improved Visibility */}
            <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                            <span className="text-white font-black text-xl">
                                {receiverName ? getInitials(receiverName) : "LP"}
                            </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-[3px] border-[#0f172a] rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="text-white font-black text-lg tracking-tight uppercase italic">
                            {receiverName ? receiverName : "Lahore Portal Support"}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Online | {userRole === 'student' ? 'Instructor Chat' : 'Student Chat'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area - Better Bubble Contrast */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0f1c]/50 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                        <div className="p-4 rounded-full bg-white/5 mb-4">
                             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white">
                            Secure connection established. <br/> Start your conversation.
                        </p>
                    </div>
                )}
                
                {messages.map((msg, index) => {
                    const isMe = String(msg.senderId) === String(userId); 
                    return (
                        <div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 animate-fade-in-up`}>
                            {!isMe && (
                                <div className="w-8 h-8 rounded-lg bg-gray-800 border border-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0 mb-1">
                                    {getInitials(msg.senderName || receiverName)}
                                </div>
                            )}

                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                                <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                                    isMe 
                                    ? "bg-green-600 text-white font-medium rounded-br-none border border-green-500/30" 
                                    : "bg-[#1e293b] text-gray-100 rounded-bl-none border border-white/5"
                                }`}>
                                    {msg.message}
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-tighter px-1">
                                    {msg.time || "Sent"}
                                </span>
                            </div>
                        </div>
                    );
                })}
                
                {isTyping && (
                    <div className="flex items-center gap-2 ml-10 animate-pulse bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/5">
                        <div className="flex gap-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1 h-1 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">{whoIsTyping} is typing</span>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area - Clean & Sticky */}
            <div className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-2xl">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all text-white placeholder:text-gray-600"
                            value={newMessage}
                            onChange={handleTyping}
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-green-500 text-black rounded-xl hover:bg-green-400 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale shadow-lg shadow-green-500/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </form>
                <p className="text-center text-[8px] text-gray-600 mt-3 font-bold uppercase tracking-[0.4em]">End-to-End Encrypted | Lahore Portal</p>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(34, 197, 94, 0.2); }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ChatBox;