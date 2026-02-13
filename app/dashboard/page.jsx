'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Cookies se data uthana
    const userId = Cookies.get('userId');
    const role = Cookies.get('role');

    // Case 1: Agar user Student hai aur uski ID mojood hai
    if (userId && role === 'student') {
      router.push(`/dashboard/student/${userId}`);
    } 
    // Case 2: Agar user Admin hai (Aapke Admin Dashboard ke liye)
    else if (role === 'admin') {
      router.push('/admin/dashboard');
    } 
    // Case 3: Agar koi login nahi hai ya role unknown hai to login pe bhejo
    else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center">
      {/* Visual redirecting indicator - Lahore Portal Style */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-green-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,197,94,0.3)]"></div>
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="text-green-500 text-xl font-black italic uppercase tracking-tighter animate-pulse">
          Verifying Lahore Portal Session...
        </div>
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          Direct Access Control | Secure Sync
        </p>
      </div>
    </div>
  );
}