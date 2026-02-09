'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const userId = Cookies.get('userId');
    const role = Cookies.get('role');

    // Case 1: Agar user Student hai
    if (userId && role === 'student') {
      router.push(`/dashboard/student/${userId}`);
    } 
    // Case 2: Agar user Admin hai (Aapke Admin Dashboard ke liye)
    else if (role === 'admin') {
      router.push('/admin/dashboard');
    } 
    // Case 3: Agar koi login nahi hai ya role unknown hai
    else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center">
      {/* Visual redirecting indicator */}
      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-green-500 font-black italic uppercase tracking-tighter animate-pulse">
        Verifying Lahore Portal Session...
      </div>
    </div>
  );
}