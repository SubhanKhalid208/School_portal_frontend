'use client'
import { handleSignup } from '../actions/auth';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    
    try {
      // Direct registration logic (Backend should save password directly)
      const result = await handleSignup(formData);
      
      console.log("Registration Result:", result);

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      } else if (result?.success) {
        toast.success("✅ Registration successful! You can now login.");
        console.log(`✅ ${email} successfully registered with password`);
        
        // Redirect to login after 1.5 seconds
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err) {
      console.error("Critical Registration Error:", err);
      toast.error("Server se rabta nahi ho saka! Phir se try karein.");
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] selection:bg-green-500/30 p-4">
      <div className="bg-[#161d2f] p-6 md:p-8 rounded-xl md:rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/5 backdrop-blur-sm">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-1 md:mb-2 text-center italic uppercase tracking-tighter">Student Registration</h2>
        <p className="text-gray-500 text-center text-[9px] md:text-[10px] mb-6 md:mb-8 uppercase tracking-[0.3em] font-bold">Lahore Education Portal</p>
        
        <form onSubmit={onSubmit} className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-gray-500 mb-1.5 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-1">Full Name</label>
            <input 
              name="name" 
              type="text" 
              required 
              className="w-full p-3 md:p-4 rounded-lg md:rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
              placeholder="Ahmed Ali"
            />
          </div>

          <div>
            <label className="block text-gray-500 mb-1.5 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full p-3 md:p-4 rounded-lg md:rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
              placeholder="ahmed@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
             <div>
                <label className="block text-gray-500 mb-1.5 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-1">Date of Birth</label>
                <input 
                  name="dob" 
                  type="date" 
                  required
                  className="w-full p-3 md:p-4 rounded-lg md:rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-[11px] md:text-xs"
                />
             </div>
             <div>
                <label className="block text-gray-500 mb-1.5 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-1">Set Password</label>
                <input 
                  name="password" 
                  type="password" 
                  required
                  className="w-full p-3 md:p-4 rounded-lg md:rounded-xl bg-black/40 text-white border border-white/10 focus:border-green-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                />
             </div>
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest py-3 md:py-4 rounded-lg md:rounded-xl transition-all shadow-lg active:scale-95 disabled:bg-gray-700 mt-3 md:mt-4 text-[10px] md:text-[11px]"
          >
            {loading ? 'Processing...' : 'Register Now'}
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center border-t border-white/5 pt-4 md:pt-6">
          <p className="text-gray-500 text-[9px] md:text-[11px] font-medium">
            Pehle se account hai?{' '}
            <Link href="/login" className="text-white hover:text-green-500 font-black uppercase ml-1 tracking-tighter transition-colors">
              Login Karein
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}