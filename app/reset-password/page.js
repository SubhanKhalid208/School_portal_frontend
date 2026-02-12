"use client"; 
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResetPasswordMutation } from '@/src/lib/redux/apiSlice';
import { toast } from 'react-hot-toast';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token'); 

    const [password, setPassword] = useState('');
    
    // ✅ Redux Mutation Hook use kiya hai
    const [resetPassword, { isLoading: loading }] = useResetPasswordMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Error: Token nahi mila - link invalid hai!");
            return;
        }

        if (password.length < 6) {
            toast.error("Error: Password kam se kam 6 characters ka hona chahiye");
            return;
        }

        try {
            // ✅ API Call via Redux
            await resetPassword({ token, password }).unwrap();
            
            toast.success("Shabash! Password successfully update ho gaya.");
            
            // 3 second baad login par bhej dega
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            console.error("❌ Reset Password Error:", err);
            const errorMsg = err?.data?.error || "Kuch ghalat hua, dobara koshish karein.";
            toast.error("Error: " + errorMsg);
        }
    };

    // Agar token na ho to Error UI dikhayein
    if (!token) {
        return (
            <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-[#161d2f] p-8 rounded-3xl border border-red-500/30 shadow-2xl max-w-md w-full">
                    <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-2">
                        Invalid Link
                    </h1>
                    <p className="text-gray-400 mb-6">Ye link expire ho gaya hai ya ghalat hai. Lahore Portal se naya link mangwayein.</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> BACK TO LOGIN
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center p-4">
            <div className="bg-[#161d2f] p-8 rounded-3xl border border-gray-800 shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black italic text-green-500 uppercase tracking-tighter">
                        LAHORE PORTAL
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Set Your New Password</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="password" 
                            placeholder="Naya Password likhein" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                            className="w-full bg-[#0a0f1c] border border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-green-500 outline-none transition-all font-medium"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                            loading 
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                            : "bg-green-500 hover:bg-green-400 text-black shadow-green-500/20"
                        }`}
                    >
                        {loading ? "Syncing DB..." : "Update Password"}
                    </button>
                </form>

                <p className="text-center text-gray-600 text-[10px] mt-8 uppercase font-bold tracking-widest">
                    Direct Access Control • Secure Encryption
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}