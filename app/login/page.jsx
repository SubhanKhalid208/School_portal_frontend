'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie'; 
import { useLoginMutation } from '@/src/lib/redux/apiSlice';

export default function LoginPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => {
    setIsClient(true);
    // Agar pehle se token hai to seedha dashboard bhej dein (Optional)
    const token = Cookies.get('token');
    if (token) {
      // router.push('/'); // Aap apni marzi se enable kar sakte hain
    }
  }, []);

  const handleGoogleLogin = () => {
    // Railway URL fix
    const backendURL = process.env.NEXT_PUBLIC_API_URL || "https://school-portal-backend-production.up.railway.app";
    window.location.href = `${backendURL}/api/auth/google`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email').trim();
    const password = formData.get('password');

    try {
      // ✅ Redux Login Call
      const result = await login({ email, password }).unwrap();
      
      if (result && (result.token || result.success)) {
        toast.success("✅ Welcome to Lahore Portal!");

        // 1. Data Extracting
        const tokenToSave = result.token;
        const userRole = result.user?.role?.toLowerCase().trim() || 'student';
        const userId = result.user?._id || result.userId;

        // 2. Cookies & Storage (Ensuring 'none' sameSite for cross-domain)
        const cookieOptions = { expires: 1, path: '/', secure: true, sameSite: 'none' };
        
        if (tokenToSave) {
          Cookies.set('token', tokenToSave, cookieOptions);
          localStorage.setItem('token', tokenToSave);
        }
        
        Cookies.set('role', userRole, cookieOptions);
        if (userId) {
          Cookies.set('userId', userId, cookieOptions);
          localStorage.setItem('userId', userId);
        }

        // 3. Smart Redirect
        // 600ms delay taake toast nazar aa jaye
        setTimeout(() => {
          if (userRole === 'admin') {
            router.replace('/admin'); 
          } else if (userRole === 'teacher') {
            router.replace('/teacher');
          } else {
            // Student path fix
            const path = userId ? `/dashboard/student/${userId}` : '/dashboard/student';
            router.replace(path);
          }
        }, 800); 
      }
    } catch (err) {
      console.error("❌ Login Failure:", err);
      // Detailed error logging
      const errorMessage = err?.data?.message || err?.error || "Login fail ho gaya! Server check karein.";
      toast.error(errorMessage);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] selection:bg-green-500/30 p-4">
      <div className="bg-[#161d2f] p-6 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 backdrop-blur-sm">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 text-center italic uppercase tracking-tighter">Lahore Portal</h2>
        <p className="text-gray-500 text-center text-[9px] md:text-[10px] mb-6 md:mb-8 uppercase tracking-[0.3em] font-bold">Direct Access Control</p>
        
        <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-gray-500 mb-2 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 md:p-4 rounded-lg md:rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
              placeholder="ahmed@lahore.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-500 mb-2 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-1">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full p-3 md:p-4 rounded-lg md:rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={isLoading}
            type="submit"
            className="w-full bg-white text-black font-black uppercase tracking-widest py-3 md:py-4 rounded-lg md:rounded-xl transition-all shadow-lg active:scale-95 disabled:bg-gray-700 mt-2 hover:bg-green-500 hover:text-white text-xs md:text-sm"
          >
            {isLoading ? 'Verifying...' : 'Login Now'}
          </button>
        </form>

        <div className="mt-6 md:mt-8">
          <div className="relative flex items-center justify-center mb-6 md:mb-8">
            <div className="border-t border-white/5 w-full"></div>
            <span className="bg-[#161d2f] px-4 text-gray-600 text-[8px] md:text-[9px] font-black absolute uppercase tracking-widest">Social Entry</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-black/40 hover:bg-black border border-white/10 text-white font-bold py-3 md:py-4 rounded-lg md:rounded-xl transition-all active:scale-95"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
            <span className="text-[9px] md:text-xs uppercase tracking-wider">Continue with Google</span>
          </button>
        </div>

        <div className="mt-6 md:mt-8 text-center border-t border-white/5 pt-4 md:pt-6">
          <p className="text-gray-500 text-[9px] md:text-[11px] font-medium">
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