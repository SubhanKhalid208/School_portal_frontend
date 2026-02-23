import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ResourceCenter = ({ courseId, userRole, userId }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(null); // Muhammad Ahmed: Edit mode tracking
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

    // Helper: API Prefix logic (As per your original code)
    const getApiPrefix = () => {
        return process.env.NEXT_PUBLIC_API_URL?.endsWith('/api')
            ? process.env.NEXT_PUBLIC_API_URL
            : `${process.env.NEXT_PUBLIC_API_URL}/api`;
    };

    // 1. Resources Fetch Karo
    const fetchResources = async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const res = await axios.get(
                `${getApiPrefix()}/resources/course/${courseId}`,
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

    // 2. Resource Upload OR Update (Teacher Only)
    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (!formData.title) return toast.error("Title is required!");

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description || 'No description');
        data.append('resource_type', formData.resource_type);
        data.append('course_id', courseId);
        data.append('teacher_id', userId);
        
        if (formData.resource_type === 'video_link') {
            data.append('video_link', formData.video_link);
        } else if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            let res;
            if (isEditing) {
                // Update Logic (Using PUT)
                res = await axios.put(`${getApiPrefix()}/resources/${isEditing}`, 
                    { title: formData.title, description: formData.description, video_link: formData.video_link }, 
                    getAuthConfig()
                );
            } else {
                // Original Upload Logic
                res = await axios.post(`${getApiPrefix()}/resources/upload`, data, getAuthConfig());
            }
            
            if (res.data.success) {
                toast.success(isEditing ? "Updated Successfully! ✏️" : "Resource Published! 🚀");
                setFormData({ title: '', description: '', resource_type: 'pdf', video_link: '', file: null });
                setIsEditing(null);
                fetchResources(); 
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed!");
        }
    };

    // 3. Delete Resource Logic
    const handleDelete = async (id) => {
        if (window.confirm("Muhammad Ahmed, kya aap waqai is resource ko delete karna chahte hain?")) {
            try {
                const res = await axios.delete(`${getApiPrefix()}/resources/${id}`, getAuthConfig());
                if (res.data.success) {
                    toast.success("Deleted! 🗑️");
                    fetchResources();
                }
            } catch (err) {
                toast.error("Delete failed!");
            }
        }
    };

    // 4. Set Edit State
    const startEdit = (res) => {
        setIsEditing(res.id);
        setFormData({
            title: res.title,
            description: res.description || '',
            resource_type: res.resource_type,
            video_link: res.resource_type === 'video_link' ? res.file_url : '',
            file: null
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="resource-container p-4 bg-transparent text-white rounded-lg">
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-green-500 underline decoration-green-500/30">
                Resource Hub {isEditing && <span className="text-blue-400 text-sm ml-4">[Editing Mode]</span>}
            </h2>

            {/* Teacher Form */}
            {userRole === 'teacher' && (
                <form onSubmit={handleUpload} className="mb-8 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Resource Title" 
                            value={formData.title}
                            className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl focus:border-green-500 outline-none transition-all text-sm" 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            required 
                        />
                        
                        <select 
                            className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl focus:border-green-500 outline-none transition-all text-sm cursor-pointer" 
                            value={formData.resource_type}
                            disabled={isEditing} // Edit ke waqt type change nahi hogi
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
                                placeholder="Paste URL here" 
                                className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl outline-none text-sm focus:border-blue-500"
                                value={formData.video_link}
                                onChange={(e) => setFormData({...formData, video_link: e.target.value})} 
                                required 
                            />
                        ) : !isEditing && ( // File upload sirf naye resource ke liye hai
                            <input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                className="block w-full p-3 bg-black/40 border border-white/10 rounded-xl file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-green-500 file:text-black file:font-black cursor-pointer text-xs"
                                onChange={(e) => setFormData({...formData, file: e.target.files[0]})} 
                                required 
                            />
                        )}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button type="submit" className={`w-full md:w-auto ${isEditing ? 'bg-blue-500' : 'bg-green-500'} text-black font-black uppercase tracking-widest px-10 py-3 rounded-xl hover:opacity-80 transition-all active:scale-95 shadow-lg`}>
                            {isEditing ? 'Update Resource' : 'Publish Resource'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={() => {setIsEditing(null); setFormData({title:'', description:'', resource_type:'pdf', video_link:'', file:null})}} className="bg-white/10 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Resources List */}
            {loading ? (
                <div className="flex flex-col items-center py-20">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.length > 0 ? resources.map((res) => (
                        <div key={res.id} className="p-5 bg-white/5 border border-white/5 rounded-[2rem] hover:border-green-500/30 transition-all group relative flex flex-col justify-between shadow-lg">
                            
                            {/* Teacher Control Buttons */}
                            {userRole === 'teacher' && (
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={() => startEdit(res)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all text-xs">✏️</button>
                                    <button onClick={() => handleDelete(res.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all text-xs">🗑️</button>
                                </div>
                            )}

                            <div>
                                <h3 className="font-black text-white uppercase tracking-tighter text-lg leading-tight group-hover:text-green-400 transition-colors pr-10">{res.title}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">By: {res.teacher_name || 'Lahore Portal'}</p>
                                    <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-bold uppercase">{res.resource_type}</span>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                {res.resource_type === 'video_link' ? (
                                    <a href={res.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                                        Open External Link
                                    </a>
                                ) : (
                                    <a href={res.file_url.startsWith('http') ? res.file_url : `${getApiPrefix().replace('/api', '')}${res.file_url}`} target="_blank" rel="noreferrer" download className="flex items-center justify-center w-full bg-green-500 text-black px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-400 transition-all">
                                        Download PDF
                                    </a>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl">
                            <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No study materials uploaded yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResourceCenter;