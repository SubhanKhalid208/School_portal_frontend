'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
// Hum safeApiCall use karenge taake code chota ho jaye
import { safeApiCall } from '@/app/utils/api';

export default function AdminUsers() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // safeApiCall khud hi getApiUrl aur fetchWithRetry ko handle karta hai
    const result = await safeApiCall('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setLoading(false);

    if (result.success) {
      toast.success(`✅ ${formData.name} ko Lahore Portal mein add kar diya gaya!`);
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } else {
      // safeApiCall hamesha result.error mein message deta hai
      toast.error(result.error || "User add nahi ho saka.");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
      <p className="text-gray-400 mb-8">Lahore Portal mein naye Students ya Teachers add karein.</p>

      <div className="bg-[#161d2f] p-8 rounded-2xl border border-gray-800 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                disabled={loading}
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none disabled:opacity-50"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email Address</label>
              <input 
                type="email" 
                required
                disabled={loading}
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none disabled:opacity-50"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input 
                type="password" 
                required
                disabled={loading}
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none disabled:opacity-50"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Assign Role</label>
              <select 
                disabled={loading}
                className="w-full bg-[#0a0f1c] border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none disabled:opacity-50"
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
            className={`w-full ${loading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20`}
          >
            {loading ? 'Creating Account...' : 'Create User Account'}
          </button>
        </form>
      </div>
    </div>
  );
}