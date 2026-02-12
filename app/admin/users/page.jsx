'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSignupMutation } from '@/src/lib/redux/apiSlice'; // ✅ Redux Hook
import { UserPlus, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function AdminUsers() {
  // ✅ Redux mutation hook use kiya hai
  const [signup, { isLoading: loading }] = useSignupMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ Redux ke zariye API call
      // .unwrap() use karne se error direct catch block mein jata hai
      await signup(formData).unwrap();

      toast.success(`✅ ${formData.name} ko Lahore Portal mein add kar diya gaya!`);
      
      // Form reset
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      console.error("❌ Signup Error:", err);
      // RTK Query ka error structure handle kiya gaya hai
      const errorMsg = err?.data?.message || err?.data?.error || "User add nahi ho saka.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
          <UserPlus className="text-green-500" size={36} /> User Management
        </h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">
          Lahore Portal: Create New Student, Teacher or Admin
        </p>
      </div>

      <div className="bg-[#161d2f] p-8 rounded-[2rem] border border-gray-800 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  disabled={loading}
                  placeholder="Muhammad Ahmed"
                  className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl p-4 text-white focus:border-green-500 outline-none transition-all disabled:opacity-50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                disabled={loading}
                placeholder="ahmed@lahoreportal.com"
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl p-4 text-white focus:border-green-500 outline-none transition-all disabled:opacity-50"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1">Secure Password</label>
              <input 
                type="password" 
                required
                disabled={loading}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl p-4 text-white focus:border-green-500 outline-none transition-all disabled:opacity-50"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 ml-1">Portal Role</label>
              <select 
                disabled={loading}
                className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl p-4 text-white focus:border-green-500 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl flex items-center justify-center gap-3 ${
              loading 
              ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-400 text-black shadow-green-500/10'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                Syncing Lahore DB...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <ShieldCheck size={20} /> Create Portal Account
              </span>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-gray-700 text-[10px] mt-8 uppercase font-bold tracking-[0.3em]">
        Authorized Access Only • Lahore Education Portal 2026
      </p>
    </div>
  );
}