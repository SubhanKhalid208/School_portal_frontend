'use client'
import { handleLogin } from '../actions/auth';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie'; 

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleGoogleLogin = () => {
    // Railway URL explicitly added for stability
    const backendURL = process.env.NEXT_PUBLIC_API_URL || "https://schoolportalbackend-production-e803.up.railway.app";
    window.location.href = `${backendURL}/api/auth/google`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await handleLogin(formData);
      
      console.log("🔐 Login Result:", result);

      if (result?.error) {
        toast.error(result.error || "Login fail ho gaya!");
        setLoading(false);
      } else if (result) {
        toast.success("✅ Welcome to Lahore Portal!");

        // 1. Data extraction & Normalization
        const tokenToSave = result.token;
        const userRole = result.role ? result.role.toLowerCase().trim() : 'student';
        const userId = result.userId;

        // 2. Persistent Saving
        if (tokenToSave) {
          Cookies.set('token', tokenToSave, { expires: 1, path: '/' });
          localStorage.setItem('token', tokenToSave);
        }
        
        Cookies.set('role', userRole, { expires: 1, path: '/' });
        if (userId) {
          Cookies.set('userId', userId, { expires: 1, path: '/' });
        }

        // 3. Redirect Logic
        setTimeout(() => {
          if (userRole === 'admin') {
            router.push('/admin'); 
          } else if (userRole === 'teacher') {
            router.push('/teacher');
          } else if (userRole === 'student') {
            router.push(userId ? `/dashboard/student/${userId}` : '/dashboard/student');
          } else {
            router.push('/');
          }
        }, 600); 
      }
    } catch (err) {
      console.error("❌ Critical Login Error:", err);
      toast.error("Server connection failed!");
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] selection:bg-green-500/30">
      <div className="bg-[#161d2f] p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 backdrop-blur-sm">
        <h2 className="text-3xl font-black text-white mb-2 text-center italic uppercase tracking-tighter">Lahore Portal</h2>
        <p className="text-gray-500 text-center text-[10px] mb-8 uppercase tracking-[0.3em] font-bold">Direct Access Control</p>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-500 mb-2 font-black text-[9px] uppercase tracking-widest px-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-4 rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
              placeholder="subhan@example.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-500 mb-2 font-black text-[9px] uppercase tracking-widest px-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full p-4 rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:bg-gray-700 mt-2 hover:bg-green-500"
          >
            {loading ? 'Verifying...' : 'Login Now'}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-8">
            <div className="border-t border-white/5 w-full"></div>
            <span className="bg-[#161d2f] px-4 text-gray-600 text-[9px] font-black absolute uppercase tracking-widest">Social Entry</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-black/40 hover:bg-black border border-white/10 text-white font-bold py-4 rounded-xl transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
            <span className="text-xs uppercase tracking-wider">Continue with Google</span>
          </button>
        </div>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <p className="text-gray-500 text-[11px] font-medium">
            Account nahi hai?{' '}
            <Link href="/register" className="text-green-500 hover:text-green-400 font-black uppercase ml-1 tracking-tighter">
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}