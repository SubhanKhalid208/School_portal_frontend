'use client'
import { useEffect, useState, use } from 'react'; 
import { toast } from 'react-hot-toast';
import { BookOpen, GraduationCap, TrendingUp, CheckCircle, Calendar, Info, MapPin } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api'; // ✅ Centralized API helper use kiya

export default function StudentDashboardPage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const [data, setData] = useState({ 
    attendancePercentage: 0, 
    totalPresent: 0, 
    totalDays: 0 
  });
  
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error("Session expired. Please login again.");
          return;
        }

        const options = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };

        // ✅ Optimized: Dono calls safeApiCall ke zariye
        const [statsRes, coursesRes] = await Promise.all([
          safeApiCall(`/student/attendance/student/${studentId}`, options),
          safeApiCall(`/student/my-courses/${studentId}`, options)
        ]);

        // Attendance Data Handle karein
        if (statsRes.success) {
          setData(statsRes.data);
        } else {
          console.error("Stats Error:", statsRes.error);
        }

        // Courses Data Handle karein
        if (coursesRes.success) {
          // Backend se agar 'courses' array aa raha hai to wo set karein
          setCourses(coursesRes.data.courses || coursesRes.data || []);
        }

      } catch (err) {
        toast.error("Lahore Portal: Syncing error!");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [studentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-green-500 text-xl font-black italic animate-pulse uppercase tracking-tighter">
          Lahore Portal Syncing...
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto text-white min-h-screen">
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic text-green-500 tracking-tighter uppercase">Student Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <MapPin size={14} className="text-red-500" />
            <p className="text-sm font-bold uppercase tracking-widest">Lahore Education Hub | ID: {studentId}</p>
          </div>
        </div>
        <div className="bg-[#161d2f] px-6 py-3 rounded-2xl border border-gray-800 shadow-lg">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Current Session</p>
            <p className="text-sm font-bold text-green-400">2025 - 2026</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatWidget 
          icon={<TrendingUp size={40}/>} 
          label="Overall Attendance" 
          value={`${data.attendancePercentage || 0}%`} 
          color="green" 
          progress={data.attendancePercentage || 0}
        />
        <StatWidget 
          icon={<CheckCircle size={40}/>} 
          label="Present Days" 
          value={data.totalPresent || 0} 
          color="blue" 
          subText="Days attended"
        />
        <StatWidget 
          icon={<Calendar size={40}/>} 
          label="Total Academic Days" 
          value={data.totalDays || 0} 
          color="purple" 
          subText="Working sessions"
        />
      </div>

      {/* Courses Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <BookOpen className="text-green-500" size={24} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight">Registered Courses</h2>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div key={index} className="group bg-[#161d2f] p-8 rounded-3xl border border-gray-800 hover:border-green-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <GraduationCap size={80} />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full uppercase tracking-widest">Active Course</span>
                  <h3 className="font-black text-white text-xl mt-4 uppercase tracking-tighter">{course.subject_name || "General Subject"}</h3>
                  <p className="text-xs text-gray-500 mt-2 font-mono">CODE: LP-{studentId}-{index + 101}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-[40px] bg-[#161d2f]/30">
            <Info className="mx-auto mb-4 text-blue-500/50" size={48} />
            <h3 className="text-xl font-black italic uppercase text-gray-400">No Courses Registered</h3>
            <p className="text-gray-600 mt-2 max-w-xs mx-auto text-sm">Please contact the Lahore Portal admin office to link your subjects.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatWidget({icon, label, value, color, progress, subText}) {
  const colors = {
    green: "text-green-500 bg-green-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    purple: "text-purple-500 bg-purple-500/10"
  };

  const textColor = colors[color].split(' ')[0];

  return (
    <div className="bg-[#161d2f] p-8 rounded-[32px] border border-gray-800 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-all">
      <div className={`absolute right-4 top-4 opacity-20 group-hover:scale-110 transition-transform duration-500 ${textColor}`}>
        {icon}
      </div>
      <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
      <h2 className={`text-6xl font-black mt-2 tracking-tighter ${textColor}`}>{value}</h2>
      
      {progress !== undefined ? (
        <div className="w-full bg-gray-800 h-2 mt-6 rounded-full overflow-hidden">
          <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      ) : (
        <p className="text-xs text-gray-600 mt-6 font-bold uppercase tracking-widest">{subText}</p>
      )}
    </div>
  );
}