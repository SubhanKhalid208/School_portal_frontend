'use client'
import { useEffect, useState, useCallback, useRef } from 'react';
import { Users, BookOpen, GraduationCap, Trash2, Edit, Search, X, Upload, FileUp, ShieldCheck, UserPlus, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    role: 'student', 
    password: '',
    profile_pic: '' 
  });

  const modalRef = useRef(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://schoolportalbackend-production-e803.up.railway.app";

  const getAuthToken = useCallback(() => {
    const token = Cookies.get('token');
    if (token) return token;
    if (typeof window !== 'undefined') return localStorage.getItem('token');
    return null;
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success && result.data) {
        setStats({
          students: result.data.students || 0,
          teachers: result.data.teachers || 0,
          courses: result.data.subjects || 0
        });
      }
    } catch (err) { console.error("Stats fetch failed"); }
  }, [API_BASE, getAuthToken]);

  const fetchUsers = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch(`${API_BASE}/admin/users?search=${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setUsers(result.success && Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      toast.error("Lahore Portal sync error!");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, getAuthToken]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchUsers, fetchStats]);

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error("Sirf CSV file allow hai!");
      return;
    }
    const token = getAuthToken();
    const data = new FormData();
    data.append('file', file);
    try {
      setBulkLoading(true);
      const loadingToast = toast.loading("Processing Lahore Portal Database...");
      const res = await fetch(`${API_BASE}/student/bulk-upload`, {
        method: 'POST',
        body: data,
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      toast.dismiss(loadingToast);
      if (res.ok) {
        toast.success(result.message || "Bulk upload successful!");
        fetchUsers();
        fetchStats();
      } else {
        toast.error(result.error || "Upload fail ho gaya.");
      }
    } catch (err) {
      toast.error("Network Error: Backend down hai.");
    } finally {
      setBulkLoading(false);
      e.target.value = ''; 
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const token = getAuthToken();
    const data = new FormData();
    data.append("file", file); 
    try {
      setUploading(true);
      const res = await fetch(`${API_BASE}/admin/upload-image`, {
        method: "POST",
        body: data,
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const result = await res.json();
      if (result.success && result.url) {
        setFormData(prev => ({ ...prev, profile_pic: result.url }));
        toast.success("Profile picture updated!");
      }
    } catch (err) {
      toast.error("Image upload fail!");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const method = editingUserId ? 'PUT' : 'POST';
    const url = editingUserId ? `${API_BASE}/admin/users/${editingUserId}` : `${API_BASE}/admin/users`;
    try {
      const token = getAuthToken();
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        toast.success(editingUserId ? "User updated!" : "User created!");
        closeModal();
        fetchUsers(searchTerm);
        fetchStats();
      } else {
        toast.error(result.error || "Ghalti!");
      }
    } catch (err) { toast.error("Server connection lost"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Kya aap waqai is user ko delete karna chahte hain?")) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/admin/users/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        toast.success("User removed.");
        fetchUsers(searchTerm); 
        fetchStats();
      }
    } catch (err) { toast.error("Delete failed"); }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUserId(user.id);
      setFormData({ 
        name: user.name || '', email: user.email || '', 
        role: user.role || 'student', password: '', 
        profile_pic: user.profile_pic || ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUserId(null);
    setFormData({ name: '', email: '', role: 'student', password: '', profile_pic: '' });
  };

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#070a13] text-white font-sans selection:bg-green-500/30">
      
      {/* --- HEADER --- */}
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-[#0f172a]/50 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-green-500/20">
            <ShieldCheck size={32} className="text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent uppercase tracking-tighter">Lahore Portal Admin</h1>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">Control Center • Master View</p>
          </div>
        </div>
        
        <div className="flex w-full lg:w-auto gap-3">
          <label className={`flex-1 lg:flex-none cursor-pointer group relative overflow-hidden ${bulkLoading ? 'bg-gray-800' : 'bg-white/5 hover:bg-white/10'} px-6 py-3 rounded-2xl border border-white/10 transition-all text-center`}>
            <div className="flex items-center justify-center gap-2 font-bold text-sm">
              <FileUp size={18} className="text-blue-400 group-hover:-translate-y-1 transition-transform" />
              <span>{bulkLoading ? "Syncing..." : "Bulk CSV"}</span>
            </div>
            <input type="file" className="hidden" accept=".csv" onChange={handleBulkUpload} disabled={bulkLoading} />
          </label>
          
          <button onClick={() => openModal()} className="flex-1 lg:flex-none bg-green-500 hover:bg-green-400 text-black px-8 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-500/10 active:scale-95 transition-all">
            <UserPlus size={18}/> <span>ADD USER</span>
          </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<GraduationCap size={24}/>} label="Total Students" value={stats.students} color="blue" grad="from-blue-600/20 to-transparent" />
        <StatCard icon={<Users size={24}/>} label="Total Teachers" value={stats.teachers} color="green" grad="from-green-600/20 to-transparent" />
        <StatCard icon={<BookOpen size={24}/>} label="Active Subjects" value={stats.courses} color="purple" grad="from-purple-600/20 to-transparent" />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-[#0f172a]/60 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-3xl backdrop-blur-sm">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-3">
            <Layers className="text-green-500" size={20} />
            <h2 className="font-bold text-lg text-white/90">User Directory</h2>
          </div>
          
          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" size={16} />
            <input 
              type="text" 
              value={searchTerm}
              placeholder="Quick search..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-green-500/50 transition-all"
              onChange={(e) => { setSearchTerm(e.target.value); fetchUsers(e.target.value); }} 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center space-y-4">
               <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
               <p className="text-gray-500 animate-pulse font-bold uppercase tracking-[0.2em] text-xs">Lahore DB Syncing...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-10 py-6 font-black">Identity</th>
                  <th className="px-10 py-6 font-black">Access Level</th>
                  <th className="px-10 py-6 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-green-500/50 transition-all">
                            {user.profile_pic ? (
                                <img src={user.profile_pic} className="w-full h-full object-cover" alt="pfp" />
                            ) : (
                                <Users size={18} className="text-gray-700" />
                            )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-100 group-hover:text-green-400 transition-colors">{user.name}</div>
                          <div className="text-xs text-gray-500 font-medium">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        user.role === 'teacher' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                        user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(user)} className="p-2.5 rounded-xl bg-white/5 hover:bg-green-500/20 hover:text-green-500 transition-all"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(user.id)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 transition-all text-gray-500"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan="3" className="p-20 text-center text-gray-600 font-bold uppercase tracking-widest text-xs italic">No users found on portal.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- SMALL & CENTERED MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200" onClick={handleOverlayClick}>
          {/* max-w-sm use kiya hai taake box kafi chota ho jaye */}
          <div ref={modalRef} className="bg-[#0f172a] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-6 relative shadow-2xl shadow-green-500/10 ring-1 ring-white/5">
            <button onClick={closeModal} className="absolute right-5 top-5 text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
            
            <h2 className="text-xl font-black mb-6 italic text-white uppercase tracking-tighter text-center">
              {editingUserId ? "Update Profile" : "New Account"}
            </h2>
            
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="flex flex-col items-center justify-center border border-white/5 rounded-2xl p-4 bg-black/20 group">
                <div className="relative w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden mb-2 group-hover:border-green-500/50 transition-all">
                    {formData.profile_pic ? <img src={formData.profile_pic} className="w-full h-full object-cover" /> : <Upload className="m-auto mt-4 text-gray-700" size={20} />}
                    {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-[8px] font-bold animate-pulse">SYNC...</div>}
                </div>
                <label className="cursor-pointer text-[9px] font-black uppercase text-green-500 hover:text-green-400 bg-green-500/5 px-3 py-1.5 rounded-lg transition-all">
                  {uploading ? "..." : "Change Image"}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} />
                </label>
              </div>

              <div className="space-y-3">
                <InputField label="Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                <InputField label="Email" type="email" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                {!editingUserId && <InputField label="Password" type="password" value={formData.password} onChange={(v) => setFormData({...formData, password: v})} />}

                <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block px-1">Access Role</label>
                  <select 
                      value={formData.role} 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500/50 text-xs appearance-none cursor-pointer transition-all"
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                      <option value="student">Student Account</option>
                      <option value="teacher">Faculty Member</option>
                      <option value="admin">System Admin</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-green-500 text-black hover:bg-green-400 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all mt-2 active:scale-95 shadow-lg shadow-green-500/10">
                {editingUserId ? "Confirm" : "Create Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({icon, label, value, color, grad}) {
  const themes = { 
    blue: "text-blue-400 border-blue-500/10", 
    green: "text-green-400 border-green-500/10", 
    purple: "text-purple-400 border-purple-500/10" 
  };
  return (
    <div className={`bg-[#0f172a]/60 p-8 rounded-[2.5rem] border ${themes[color]} bg-gradient-to-br ${grad} flex items-center gap-6 shadow-xl group hover:-translate-y-1 transition-all`}>
      <div className="p-4 rounded-2xl bg-black/40 text-inherit shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        <h2 className="text-4xl font-black mt-1 text-white tracking-tighter">{value}</h2>
      </div>
    </div>
  );
}

function InputField({label, type="text", value, onChange}) {
  return (
    <div>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block px-1">{label}</label>
      <input 
        required type={type} value={value || ''} 
        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-green-500/50 text-xs transition-all placeholder:text-gray-700" 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}