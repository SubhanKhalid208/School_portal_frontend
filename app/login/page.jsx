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
        toast.success("✅ Login Successful! Redirecting...");

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

        // 3. ✅ FIX: Paths updated to match your VS Code Folder Structure
        setTimeout(() => {
          if (userRole === 'admin') {
            // Aapka folder app/admin hai, dashboard/admin nahi
            router.push('/admin'); 
          } else if (userRole === 'teacher') {
            // Aapka folder app/teacher hai
            router.push('/teacher');
          } else if (userRole === 'student') {
            // Students abhi dashboard folder mein hain
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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="bg-[#161d2f] p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Lahore Portal</h2>
        <p className="text-gray-500 text-center text-sm mb-6 uppercase tracking-widest font-bold">Official Login</p>
        
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-400 mb-2 font-semibold text-xs uppercase">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none transition-all"
              placeholder="subhan@example.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 mb-2 font-semibold text-xs uppercase">Password</label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full p-3 rounded-lg bg-[#1f2937] text-white border border-gray-600 focus:border-green-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:bg-gray-700"
          >
            {loading ? 'Authenticating...' : 'Login Portal'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-gray-700 w-full"></div>
            <span className="bg-[#161d2f] px-3 text-gray-500 text-[10px] font-bold absolute">SECURE OAUTH</span>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-lg transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
            Sign in with Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Naya account chahiye?{' '}
            <Link href="/register" className="text-green-500 hover:underline font-bold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}