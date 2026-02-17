import React, { useState } from 'react';

const IdentityCard = ({ user, isOpen, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  // Role aur Data extract karna
  const userData = user?.user || user; 
  const userName = userData?.name || "User";
  const userId = userData?.id || user?.id || '00';
  const role = user?.role?.toLowerCase() || 'student'; // 'teacher' ya 'student'

  const getProfilePic = () => {
    const rawPic = userData?.profile_pic || userData?.image;
    if (!rawPic) {
      return `https://ui-avatars.com/api/?name=${userName}&background=22c55e&color=fff&size=128`;
    }
    if (rawPic.startsWith('http')) return rawPic;

    const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const cleanPath = rawPic.startsWith('/') ? rawPic : `/${rawPic}`;
    return `${backendURL}${cleanPath}`;
  };

  // --- Picture Upload Handle ---
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);
    
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Role ke mutabiq endpoint select karna
      const endpoint = role === 'teacher' 
        ? `/api/teacher/upload-profile-pic/${userId}` 
        : `/api/student/upload-profile-pic/${userId}`;

      const response = await fetch(`${backendURL}${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert("Profile picture updated successfully!");
        window.location.reload(); 
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Server error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999]">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-green-500/50 rounded-3xl p-8 w-80 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)] overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="bg-green-500 text-slate-900 font-black text-[10px] py-1 px-3 rounded-full inline-block mb-2 tracking-widest">
            LAHORE EDUCATION HUB
          </div>
          <h3 className="text-white font-bold text-[11px] tracking-[0.2em] opacity-80 uppercase">
            {role === 'teacher' ? 'Teacher Identity Card' : 'Student Identity Card'}
          </h3>
        </div>

        {/* Profile Picture Section */}
        <div className="flex justify-center mb-6">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-2xl border-2 border-green-500 p-1 bg-slate-800 overflow-hidden rotate-2 group-hover:rotate-0 transition-transform duration-500 shadow-lg ${isUploading ? 'opacity-50' : ''}`}>
              <img 
                src={getProfilePic()} 
                alt={userName} 
                className="w-full h-full rounded-xl object-cover"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=${userName}&background=22c55e&color=fff`;
                }}
              />
            </div>

            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl rotate-2 group-hover:rotate-0">
              <span className="text-[10px] text-white font-bold uppercase tracking-tighter">
                {isUploading ? 'Uploading...' : 'Change Photo'}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
            </label>

            <div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-slate-900 animate-pulse"></div>
          </div>
        </div>

        {/* Info Section */}
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-1">
            {userName} 
          </h2>
          <p className="text-green-400 font-mono font-bold text-lg tracking-widest">
            #{role === 'teacher' ? 'TCH' : 'STU'}-{userId}
          </p>
          
          <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-[10px]">
            <div className="text-left">
              <p className="text-gray-500 font-bold uppercase tracking-tighter">Campus</p>
              <p className="text-white font-medium uppercase">Lahore Main</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-bold uppercase tracking-tighter">Designation</p>
              <p className="text-green-500 font-black italic underline decoration-green-500/20 uppercase">
                {role === 'teacher' ? 'FACULTY ✅' : 'VERIFIED ✅'}
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-all hover:rotate-90"
        >
          ✕
        </button>

        {/* Background Glows */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default IdentityCard;