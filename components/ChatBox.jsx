import React, { useState, useEffect, useRef, useMemo } from 'react';
import { io } from "socket.io-client";
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ChatBox = ({ roomId, userId, userName, userRole, onNewMessage, receiverId, receiverName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [whoIsTyping, setWhoIsTyping] = useState("");
    const [uploading, setUploading] = useState(false);
    const scrollRef = useRef();
    const fileInputRef = useRef();

    // API Configuration
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000";

    const activeRoom = useMemo(() => {
        if (receiverId && userId) {
            const ids = [Number(userId), Number(receiverId)].sort((a, b) => a - b);
            return `${ids[0]}_${ids[1]}`; 
        }
        return roomId || "GLOBAL_ROOM";
    }, [userId, receiverId, roomId]);

    // Fetch Chat History with Backup Polling
    useEffect(() => {
        const fetchChatHistory = async () => {
            if (!activeRoom || (activeRoom === "GLOBAL_ROOM" && !roomId)) return;
            try {
                const response = await fetch(`${apiBase}/chat/chat-history/${activeRoom}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                const result = await response.json();
                
                if (result.success && Array.isArray(result.data)) {
                    // Update messages only if data has changed to prevent unnecessary re-renders
                    setMessages((prev) => {
                        if (JSON.stringify(prev) !== JSON.stringify(result.data)) {
                            return result.data;
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error("❌ History error:", err);
            }
        };

        fetchChatHistory(); // Initial fetch on load

        // Subhan, ye line har 5 second baad background mein sync karegi
        const intervalId = setInterval(fetchChatHistory, 5000); 

        return () => clearInterval(intervalId); // Cleanup interval
    }, [activeRoom, roomId, apiBase]);

    // Socket Connection Logic
    useEffect(() => {
        const newSocket = io(serverUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'] 
        });
        
        setSocket(newSocket);

        newSocket.on("connect", () => {
            newSocket.emit("join_room", activeRoom);
        });

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
    }, [activeRoom, userId, onNewMessage, serverUrl]); 

    // Auto Scroll to Bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const res = await axios.post(`${apiBase}/chat/upload`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                const messageData = {
                    room: activeRoom,
                    senderId: userId,
                    senderName: userName,
                    receiverId: receiverId,
                    message: "", 
                    fileUrl: res.data.fileUrl,
                    fileName: res.data.fileName,
                    role: userRole,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };

                setMessages((prev) => [...prev, messageData]);
                socket.emit("send_message", messageData);
                toast.success("File sent!");
            }
        } catch (err) {
            toast.error("Upload failed!");
        } finally {
            setUploading(false);
            if (e.target) e.target.value = null; 
        }
    };

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
            
            {/* Header */}
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0a0f1c]/50 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
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
                                    {msg.message && <p>{msg.message}</p>}
                                    {msg.fileUrl && (
                                        <div className="mt-2">
                                            {msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                                                <img 
                                                    src={`${serverUrl}${msg.fileUrl}`} 
                                                    alt="upload" 
                                                    className="max-w-full rounded-lg border border-white/10 cursor-pointer hover:opacity-80"
                                                    onClick={() => window.open(`${serverUrl}${msg.fileUrl}`, '_blank')}
                                                />
                                            ) : (
                                                <a 
                                                    href={`${serverUrl}${msg.fileUrl}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 bg-black/20 p-2 rounded-lg hover:bg-black/30 transition-all underline decoration-dotted"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                                    <span className="truncate max-w-[150px] text-xs">{msg.fileName || 'View Document'}</span>
                                                </a>
                                            )}
                                        </div>
                                    )}
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
                        <span className="text-[9px] text-green-500 font-black uppercase tracking-widest">{whoIsTyping} is typing</span>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white/5 border-t border-white/10 backdrop-blur-2xl">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-green-500 hover:border-green-500/50 transition-all disabled:opacity-50"
                    >
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        )}
                    </button>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*,.pdf,.doc,.docx"
                    />

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
                            disabled={!newMessage.trim() && !uploading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-green-500 text-black rounded-xl hover:bg-green-400 active:scale-95 transition-all disabled:opacity-20 shadow-lg"
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