import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ResourceCenter = ({ courseId, userRole, userId }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        resource_type: 'pdf',
        video_link: '',
        file: null
    });

    // ✅ Muhammad Ahmed: Token nikalne ka function (Safe way)
    const getAuthConfig = () => {
        const token = localStorage.getItem('token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    };

    // 1. Resources Fetch Karo
    const fetchResources = async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            // Backend URL check karein: `${process.env.NEXT_PUBLIC_API_URL}/resources/course/${courseId}`
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/resources/course/${courseId}`,
                getAuthConfig()
            );
            if (res.data.success) {
                setResources(res.data.resources);
            }
        } catch (err) { 
            console.error("Error fetching resources:", err.response?.data || err.message);
            if (err.response?.status === 401 || err.response?.status === 403) {
                console.log("Muhammad Ahmed, session expire ho gaya hai.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchResources(); 
    }, [courseId]);

    // 2. Resource Upload (Teacher Only)
    const handleUpload = async (e) => {
        e.preventDefault();
        
        // Form Validation
        if (!formData.title) return toast.error("Title is required!");

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description || 'No description');
        data.append('resource_type', formData.resource_type);
        data.append('course_id', courseId);
        data.append('teacher_id', userId);
        
        if (formData.resource_type === 'video_link') {
            if (!formData.video_link) return toast.error("Please provide a video link!");
            data.append('video_link', formData.video_link);
        } else {
            if (!formData.file) return toast.error("Please select a file!");
            data.append('file', formData.file);
        }

        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/resources/upload`,
                data,
                getAuthConfig()
            );
            
            if (res.data.success) {
                toast.success("Resource Published! 🚀");
                // Reset form
                setFormData({ title: '', description: '', resource_type: 'pdf', video_link: '', file: null });
                // Refresh list
                fetchResources(); 
            }
        } catch (err) { 
            console.error("Upload Error:", err.response?.data || err.message);
            toast.error(err.response?.data?.error || "Upload failed!"); 
        }
    };

    return (
        <div className="resource-container p-4 bg-transparent text-white rounded-lg">
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-green-500 underline decoration-green-500/30">Resource Hub</h2>

            {/* Teacher Form - Muhammad Ahmed: Ye sirf teacher ko dikhega */}
            {userRole === 'teacher' && (
                <form onSubmit={handleUpload} className="mb-8 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Resource Title (e.g. Week 1 Notes)" 
                            value={formData.title}
                            className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl focus:border-green-500 outline-none transition-all text-sm" 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            required 
                        />
                        
                        <select 
                            className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl focus:border-green-500 outline-none transition-all text-sm cursor-pointer" 
                            value={formData.resource_type}
                            onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
                        >
                            <option value="pdf">PDF Document</option>
                            <option value="video_link">External Link / Video</option>
                        </select>
                    </div>

                    <div className="mt-4">
                        {formData.resource_type === 'video_link' ? (
                            <input 
                                type="url" 
                                placeholder="Paste URL here (https://...)" 
                                className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl outline-none text-sm focus:border-blue-500"
                                value={formData.video_link}
                                onChange={(e) => setFormData({...formData, video_link: e.target.value})} 
                                required 
                            />
                        ) : (
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx"
                                    className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-green-500 file:text-black file:font-black cursor-pointer text-xs"
                                    onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
                                    required 
                                />
                            </div>
                        )}
                    </div>

                    <button type="submit" className="mt-4 w-full md:w-auto bg-green-500 text-black font-black uppercase tracking-widest px-10 py-3 rounded-xl hover:bg-green-400 transition-all active:scale-95 shadow-lg shadow-green-500/20">
                        Publish Resource
                    </button>
                </form>
            )}

            {/* Resources List */}
            {loading ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 animate-pulse uppercase font-black tracking-widest text-[10px]">Loading Materials...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.length > 0 ? resources.map((res) => (
                        <div key={res.id} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] hover:border-green-500/30 transition-all group flex flex-col justify-between shadow-lg">
                            <div>
                                <h3 className="font-black text-white uppercase tracking-tighter text-lg leading-tight group-hover:text-green-400 transition-colors">{res.title}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">By: {res.teacher_name || 'Lahore Portal'}</p>
                                    <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-bold uppercase">{res.resource_type}</span>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                {res.resource_type === 'video_link' ? (
                                    <a href={res.file_url} target="_blank" rel="noreferrer"
                                       className="flex items-center justify-center w-full bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-md">
                                        Open External Link
                                    </a>
                                ) : (
                                    <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api','') || ''}${res.file_url}`} target="_blank" rel="noreferrer" download
                                       className="flex items-center justify-center w-full bg-green-500 text-black px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all shadow-md">
                                        Download PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No study materials uploaded for this course yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResourceCenter;