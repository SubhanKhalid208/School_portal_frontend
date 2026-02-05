"use client"; 
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

// 1. Pehle aik chota component banaya jo logic handle karega
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const token = searchParams.get('token'); 

    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Live backend URL use kiya jo Railway par hai
            const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            
            const res = await axios.post(`${backendURL}/api/auth/reset-password`, {
                token,
                password
            });
            setMessage("Shabash! Password set ho gaya hai. 3 second mein login par ja rahe hain...");
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.error || "Kuch ghalat hua"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
            <h1 style={{ color: '#28a745' }}>Lahore Portal - Set Password</h1>
            <p>Apna naya password yahan likhein:</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
                <input 
                    type="password" 
                    placeholder="Naya Password likhein" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        padding: '12px', 
                        backgroundColor: '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? "Update ho raha hai..." : "Password Update Karein"}
                </button>
            </form>
            {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
        </div>
    );
}

// 2. Main Page component jo Suspense use karta hai
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}