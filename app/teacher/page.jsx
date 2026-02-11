'use client'
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getApiUrl, fetchWithRetry } from '@/app/utils/api';

export default function TeacherDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalSubjects: 0, teacherName: '' });
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // ✅ Stable fetch function with useCallback
  const fetchDashboardData = useCallback(async () => {
    // Token ko function ke andar nikalna behtar hai taake latest value milay
    const token = localStorage.getItem('token');
    const backupName = Cookies.get('userName') || 'Teacher';

    if (!token) {
      toast.error("Aap login nahi hain. Dubara login karein.");
      setLoading(false);
      return;
    }

    try {
      const courseUrl = getApiUrl(`/teacher/my-courses`);
      const statsUrl = getApiUrl(`/teacher/stats`);
      
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [courseRes, statsRes] = await Promise.all([
        fetchWithRetry(courseUrl, { method: 'GET', headers }, 1),
        fetchWithRetry(statsUrl, { method: 'GET', headers }, 1)
      ]);

      if (courseRes.status === 401 || statsRes.status === 401) {
        toast.error("Session expire ho gaya hai.");
        return;
      }

      const coursesData = await courseRes.json();
      const statistics = await statsRes.json();
      
      setMyCourses(Array.isArray(coursesData.data) ? coursesData.data : []);
      
      setStats({
        totalStudents: statistics.totalStudents || 0,
        totalSubjects: statistics.totalSubjects || 0,
        teacherName: statistics.teacherName || backupName 
      }); 
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      toast.error("Dashboard data load nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (typeof window !== 'undefined') {
      fetchDashboardData(); 
    }
  }, [fetchDashboardData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = editingCourse ? 'PUT' : 'POST';
    const endpoint = editingCourse 
      ? `/teacher/courses/${editingCourse.id}` 
      : `/teacher/courses/add`;

    try {
      const url = getApiUrl(endpoint);
      const res = await fetchWithRetry(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      }, 1);

      if (res.ok) {
        toast.success(editingCourse ? "✅ Subject update ho gaya!" : "✅ Naya subject ban gaya!");
        setShowModal(false);
        setEditingCourse(null);
        setFormData({ title: '', description: '' });
        fetchDashboardData(); 
      } else {
        const error = await res.json();
        toast.error(error.error || "Process fail ho gaya.");
      }
    } catch (err) {
      toast.error("Server connection error.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm("Kya aap waqai delete karna chahte hain?")) return;
    try {
      const url = getApiUrl(`/teacher/courses/${id}`);
      const res = await fetchWithRetry(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }, 1);
      
      if (res.ok) {
        toast.success("✅ Subject delete ho gaya.");
        fetchDashboardData();
      } else {
        toast.error("❌ Delete fail.");
      }
    } catch (err) {
      toast.error("Delete command fail ho gayi.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="p-10 text-blue-500 text-2xl font-bold animate-pulse italic uppercase">
           Lahore Portal Dashboard Load Ho Raha Hai...
        </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Teacher Name</p>
          <h3 className="font-black text-lg text-blue-400 italic">
            {stats.teacherName}
          </h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Total Subjects</p>
          <h3 className="font-black text-2xl text-purple-400">{stats.totalSubjects}</h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Total Students</p>
          <h3 className="font-black text-2xl text-green-400">{stats.totalStudents}</h3>
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setFormData({title:'', description:''}); setShowModal(true); }}
          className="bg-[#161d2f] p-6 rounded-2xl border border-orange-500/30 border-dashed flex items-center justify-center text-orange-400 font-black uppercase text-xs hover:bg-orange-500/10 transition-all shadow-xl"
        >
          + Add New Subject
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">My Managed Subjects</h2>
          <span className="text-[10px] bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 font-bold uppercase">Lahore Central</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-5">Subject Name</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myCourses.length > 0 ? myCourses.map((course) => (
                <tr key={course.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-5 font-bold text-blue-300 group-hover:text-blue-100">{course.name || course.title}</td>
                  <td className="p-5 text-gray-400 text-sm max-w-[300px] truncate">{course.description || "No description provided."}</td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => { setEditingCourse(course); setFormData({title: course.name || course.title, description: course.description}); setShowModal(true); }}
                      className="text-blue-400 mr-4 hover:text-blue-200 font-bold text-xs uppercase transition-colors"
                    >Edit</button>
                    <button onClick={() => handleDelete(course.id)} className="text-red-500 hover:text-red-300 font-bold text-xs uppercase transition-colors">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-gray-500 italic text-sm font-medium uppercase tracking-widest">No subjects found in your portal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-[#161d2f] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white italic uppercase tracking-tighter">{editingCourse ? 'Edit Subject' : 'Add New Subject'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Subject Title</label>
                <input 
                  type="text" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mt-1 outline-none focus:border-blue-500 transition-all text-sm"
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Description</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mt-1 outline-none h-28 focus:border-blue-500 transition-all text-sm"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 py-4 rounded-xl hover:bg-white/10 transition-colors uppercase font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-xl font-black uppercase text-xs hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 tracking-widest">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}