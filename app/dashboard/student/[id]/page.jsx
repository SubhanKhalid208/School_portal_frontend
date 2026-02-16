'use client'
import { useEffect, useState, use } from 'react'; 
import { toast } from 'react-hot-toast';
import { BookOpen, GraduationCap, TrendingUp, CheckCircle, Calendar, Info, MapPin, Contact2 } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api'; 

import QuizProgressChart from './_components/QuizProgressChart';
import AttendanceBarChart from './_components/AttendanceBarChart';
import StudentIDCard from '@/components/StudentIDCard';

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
  const [analytics, setAnalytics] = useState({ quizTrends: [], attendanceTrends: [] });
  
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        const [statsRes, coursesRes, analyticsRes] = await Promise.all([
          safeApiCall(`student/attendance/student/${studentId}`),
          safeApiCall(`student/my-courses/${studentId}`),
          safeApiCall(`student/analytics/${studentId}`)
        ]);

        // ✅ Attendance Data Fix: Multiple layers check kar rahe hain taake data miss na ho
        if (statsRes && statsRes.success) {
          const stats = statsRes.data?.data || statsRes.data || statsRes; 
          setData({
            attendancePercentage: stats.attendancePercentage ?? 0,
            totalPresent: stats.totalPresent ?? 0,
            totalDays: stats.totalDays ?? 0
          });
          
          setUserData({
            id: studentId,
            name: stats.studentName || stats.name || "Muhammad Ahmed", 
            profile_pic: stats.profile_pic || stats.image || null
          });
        }

        // ✅ Courses Data Fix
        if (coursesRes && coursesRes.success) {
          const courseList = coursesRes.data?.data?.courses || coursesRes.data?.courses || coursesRes.courses || [];
          setCourses(Array.isArray(courseList) ? courseList : []);
        }

        // ✅ Analytics Data Fix
        if (analyticsRes && analyticsRes.success) {
          const analyticData = analyticsRes.data?.data || analyticsRes.data || analyticsRes;
          setAnalytics({
            quizTrends: Array.isArray(analyticData.quizTrends) ? analyticData.quizTrends : [],
            attendanceTrends: Array.isArray(analyticData.attendanceTrends) ? analyticData.attendanceTrends : []
          });
        }

      } catch (err) {
        console.error("Critical Sync Error:", err);
        toast.error("Lahore Portal: Syncing error!");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
        <div className="text-green-500 text-xl font-black italic uppercase tracking-tighter">
          Lahore Portal Syncing...
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto text-white min-h-screen selection:bg-green-500/30">
      
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase">
            Student <span className="text-green-500">Dashboard</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <MapPin size={14} className="text-red-500 animate-bounce" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Lahore Education Hub | ID: {studentId}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCardOpen(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/50 px-5 py-3 rounded-2xl transition-all group shadow-xl"
            >
              <Contact2 className="text-green-500 group-hover:scale-110 transition-transform" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">View ID Card</span>
            </button>

            <div className="bg-[#161d2f] px-6 py-4 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-sm hidden sm:block">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mb-1">Current Session</p>
                <p className="text-sm font-black text-green-400 italic">2025 - 2026 Academic Year</p>
            </div>
        </div>
      </div>

      <StudentIDCard 
        user={userData} 
        isOpen={isCardOpen} 
        onClose={() => setIsCardOpen(false)} 
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatWidget 
          icon={<TrendingUp size={40}/>} 
          label="Overall Attendance" 
          value={`${data.attendancePercentage}%`} 
          color="green" 
          progress={data.attendancePercentage}
        />
        <StatWidget 
          icon={<CheckCircle size={40}/>} 
          label="Present Days" 
          value={data.totalPresent} 
          color="blue" 
          subText="Days attended this month"
        />
        <StatWidget 
          icon={<Calendar size={40}/>} 
          label="Total Academic Days" 
          value={data.totalDays} 
          color="purple" 
          subText="Working sessions in portal"
        />
      </div>

      {/* Performance Analytics */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="text-green-500" size={24} />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Performance Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuizProgressChart data={analytics.quizTrends} />
            <AttendanceBarChart data={analytics.attendanceTrends} />
        </div>
      </div>

      {/* Courses Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
            <BookOpen className="text-green-500" size={24} />
          </div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Registered Courses</h2>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div key={course.id || index} className="group bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 hover:border-green-500/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:rotate-12">
                    <GraduationCap size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-green-500/10">Active</span>
                  </div>
                  <h3 className="font-black text-white text-xl mt-6 uppercase tracking-tighter leading-tight group-hover:text-green-400 transition-colors">
                    {course.subject_name || course.title || "General Subject"}
                  </h3>
                  <div className="flex items-center gap-2 mt-4 text-gray-500">
                    <div className="h-[1px] w-6 bg-gray-800"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Code: LP-{String(studentId).slice(-3)}-{index + 101}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/5 rounded-[3rem] bg-[#161d2f]/50 backdrop-blur-sm shadow-inner">
            <Info className="mx-auto mb-6 text-blue-500/20" size={64} />
            <h3 className="text-xl font-black italic uppercase text-gray-400 tracking-tighter">No Courses Found</h3>
            <p className="text-gray-600 mt-2 max-w-xs mx-auto text-xs font-bold uppercase tracking-widest leading-relaxed">
              Contact Lahore Central Portal to sync your academic records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatWidget({icon, label, value, color, progress, subText}) {
  const colors = {
    green: "text-green-500 bg-green-500/5 border-green-500/10",
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10",
    purple: "text-purple-500 bg-purple-500/5 border-purple-500/10"
  };

  const currentTheme = colors[color] || colors.green;
  const textColor = currentTheme.split(' ')[0];

  return (
    <div className={`bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:bg-white/[0.02] transition-all duration-500`}>
      <div className={`absolute right-6 top-6 opacity-[0.07] group-hover:opacity-20 group-hover:scale-125 transition-all duration-700 ${textColor}`}>
        {icon}
      </div>
      <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{label}</p>
      <h2 className={`text-6xl font-black tracking-tighter ${textColor} italic`}>{value}</h2>
      
      {progress !== undefined ? (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Performance Track</span>
            <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">{progress}%</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div className="bg-green-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-800 animate-pulse"></div>
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{subText}</p>
        </div>
      )}
    </div>
  );
}