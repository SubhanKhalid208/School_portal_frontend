'use client'
import { useEffect, useState, use } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { toast } from 'react-hot-toast';
import { 
  BookOpen, GraduationCap, TrendingUp, CheckCircle, 
  Calendar, Info, MapPin, Contact2, ArrowRight, LogOut,
  Library, MessageCircle, X 
} from 'lucide-react'; 
import { safeApiCall } from '@/app/utils/api'; 
import Cookies from 'js-cookie'; 

import QuizProgressChart from './_components/QuizProgressChart';
import AttendanceBarChart from './_components/AttendanceBarChart';
import StudentIDCard from '@/components/StudentIDCard';
import ResourceCenter from '@/components/ResourceCenter'; 
import ChatBox from '@/components/ChatBox'; 

export default function StudentDashboardPage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState({ 
    attendancePercentage: 0, 
    totalPresent: 0, 
    totalDays: 0 
  });
  
  const [courses, setCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ quizTrends: [], attendanceTrends: [] });
  
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [userData, setUserData] = useState(null);

  // ✅ MUHAMMAD AHMED: Unread Messages State
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Selected Course State for Resources & Chat
  const [selectedCourseForResources, setSelectedCourseForResources] = useState(null);

  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('token'); 
    Cookies.remove('role');
    localStorage.clear();
    toast.success("Logging out of Lahore Portal...");
    window.location.href = '/login';
  };

  const scrollToResources = () => {
    const element = document.getElementById('resource-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // ✅ Scroll to Chat & Reset Unread Count
  const scrollToChat = () => {
    setIsChatOpen(true);
    setUnreadCount(0); 
    setTimeout(() => {
        const element = document.getElementById('chat-section');
        element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ✅ Function to handle new incoming messages from ChatBox
  const handleNewMessage = () => {
    if (!isChatOpen) {
        setUnreadCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error("Session expired. Please login again.");
          setLoading(false);
          router.push('/login');
          return;
        }

        const [statsRes, coursesRes, analyticsRes] = await Promise.all([
          safeApiCall(`student/attendance/student/${studentId}`),
          safeApiCall(`student/my-courses/${studentId}`),
          safeApiCall(`student/analytics/${studentId}`)
        ]);

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
            profile_pic: stats.profile_pic || stats.image || null,
            role: 'student'
          });
        }

        if (coursesRes && coursesRes.success) {
          const courseList = coursesRes.data?.data?.courses || coursesRes.data?.courses || coursesRes.courses || [];
          setCourses(Array.isArray(courseList) ? courseList : []);
          
          if (Array.isArray(courseList) && courseList.length > 0) {
            setSelectedCourseForResources(courseList[0].id);
          }
        }

        if (analyticsRes && analyticsRes.success) {
          const analyticData = analyticsRes.data?.data || analyticsRes.data || analyticsRes;
          setAnalytics({
            quizTrends: Array.isArray(analyticData.quizTrends) ? analyticData.quizTrends : [],
            attendanceTrends: Array.isArray(analyticData.attendanceTrends) ? analyticData.attendanceTrends : []
          });
        }

      } catch (err) {
        console.error("Critical Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [studentId, router]);

  const handleCourseClick = (courseId) => {
    setSelectedCourseForResources(courseId);
    scrollToResources(); 
    toast.success("Syncing Subject Resources...");
  };

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
    <div className="p-4 md:p-6 max-w-7xl mx-auto text-white min-h-screen selection:bg-green-500/30">
      
      {/* Header */}
      <div className="mb-8 md:mb-10 flex flex-col gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter uppercase">
              Student <span className="text-green-500">Dashboard</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <MapPin size={14} className="text-red-500 animate-bounce hidden sm:inline" />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Lahore Education Hub | ID: {studentId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button onClick={scrollToChat} className="relative flex items-center gap-2 bg-green-500/10 hover:bg-green-500 border border-green-500/20 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all group shadow-xl text-xs md:text-[10px]">
                <MessageCircle className="text-green-500 group-hover:text-white transition-transform" size={16} />
                <span className="font-black uppercase tracking-widest group-hover:text-white text-green-500 hidden sm:inline italic">Live Support</span>
                <span className="font-black uppercase tracking-widest group-hover:text-white text-green-500 sm:hidden italic">Chat</span>
                
                {unreadCount > 0 && !isChatOpen && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0a0f1c] animate-bounce shadow-xl">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
              </button>

              <button onClick={scrollToResources} className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all group shadow-xl text-xs md:text-[10px]">
                <Library className="text-blue-500 group-hover:text-white" size={16} />
                <span className="font-black uppercase tracking-widest hidden sm:inline text-blue-400 group-hover:text-white">Library</span>
                <span className="font-black uppercase tracking-widest sm:hidden text-blue-400 group-hover:text-white">Library</span>
              </button>

              <button onClick={() => setIsCardOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all group shadow-xl text-xs md:text-[10px]">
                <Contact2 className="text-gray-400 group-hover:text-white" size={16} />
                <span className="font-black uppercase tracking-widest hidden sm:inline text-gray-400 group-hover:text-white">ID Card</span>
                <span className="font-black uppercase tracking-widest sm:hidden text-gray-400 group-hover:text-white">ID</span>
              </button>

              <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl transition-all group shadow-xl text-xs md:text-[10px]">
                <LogOut className="text-red-500 group-hover:text-white" size={16} />
                <span className="font-black uppercase tracking-widest group-hover:text-white text-red-500 hidden sm:inline">Logout</span>
              </button>
          </div>
        </div>
      </div>

      <StudentIDCard user={userData} isOpen={isCardOpen} onClose={() => setIsCardOpen(false)} />

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16">
        <StatWidget icon={<TrendingUp size={40}/>} label="Overall Attendance" value={`${data.attendancePercentage}%`} color="green" progress={data.attendancePercentage} />
        <StatWidget icon={<CheckCircle size={40}/>} label="Present Days" value={data.totalPresent} color="blue" subText="Days attended this month" />
        <StatWidget icon={<Calendar size={40}/>} label="Total Academic Days" value={data.totalDays} color="purple" subText="Working sessions in portal" />
      </div>

      {/* ✅ MUHAMMAD AHMED: LIVE CHAT HUB - FIXED FOR 31_32 */}
      {isChatOpen && (
        <div id="chat-section" className="mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-3 bg-green-500/10 rounded-xl md:rounded-2xl border border-green-500/20">
                        <MessageCircle className="text-green-500" size={20} />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Live Interaction Hub</h2>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>
            
            <div className="bg-[#161d2f]/50 rounded-[2.5rem] border border-white/5 p-2 backdrop-blur-xl shadow-2xl">
                <ChatBox 
                    userId={studentId} 
                    receiverId={31} // Muhammad Ahmed: 31_32 room banane ke liye
                    receiverName="Course Instructor"
                    userName={userData?.name || "Muhammad Ahmed"} 
                    userRole="student"
                    onNewMessage={handleNewMessage} 
                />
            </div>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="mb-12 md:mb-16">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
            <TrendingUp className="text-green-500" size={20} />
            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Performance Analytics</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <QuizProgressChart data={analytics.quizTrends} />
            <AttendanceBarChart data={analytics.attendanceTrends} />
        </div>
      </div>

      {/* Courses List */}
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="p-2 md:p-3 bg-green-500/10 rounded-xl md:rounded-2xl border border-green-500/20">
            <BookOpen className="text-green-500" size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Registered Courses</h2>
        </div>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {courses.map((course, index) => (
              <div 
                key={course.id || index} 
                onClick={() => handleCourseClick(course.id)} 
                className={`group bg-[#161d2f] p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border ${selectedCourseForResources === course.id ? 'border-green-500' : 'border-white/5'} hover:border-green-500/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden cursor-pointer active:scale-95`}
              >
                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 group-hover:rotate-12">
                    <GraduationCap size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-[8px] md:text-[9px] font-black bg-green-500/10 text-green-500 px-2 md:px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-green-500/10">Active</span>
                    <ArrowRight className="text-white/20 group-hover:text-green-500 transition-colors transform group-hover:translate-x-2" size={16} />
                  </div>
                  <h3 className="font-black text-white text-lg md:text-xl mt-4 md:mt-6 uppercase tracking-tighter leading-tight group-hover:text-green-400 transition-colors">
                    {course.subject_name || course.title || "General Subject"}
                  </h3>
                  <div className="flex items-center gap-2 mt-3 md:mt-4 text-gray-500">
                    <div className="h-[1px] w-6 bg-gray-800"></div>
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Code: LP-{String(studentId).slice(-3)}-{index + 101}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 md:py-24 text-center border border-white/5 rounded-xl md:rounded-[3rem] bg-[#161d2f]/50 backdrop-blur-sm shadow-inner">
            <span className="flex justify-center mb-4"><Info className="text-blue-500/20" size={48} /></span>
            <h3 className="text-lg md:text-xl font-black italic uppercase text-gray-400 tracking-tighter">No Courses Found</h3>
          </div>
        )}
      </div>

      {/* RESOURCE CENTER SECTION */}
      <div id="resource-section" className="mb-20 pt-16 border-t border-white/5">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 md:p-3 bg-blue-500/10 rounded-xl md:rounded-2xl border border-blue-500/20">
            <Library className="text-blue-500" size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Learning Resources Hub</h2>
        </div>
        
        <div className="bg-[#161d2f]/30 rounded-[2.5rem] border border-white/5 p-4 md:p-10 backdrop-blur-md">
            {selectedCourseForResources ? (
                <ResourceCenter 
                    courseId={selectedCourseForResources} 
                    userRole="student" 
                    userId={studentId} 
                />
            ) : (
                <div className="py-20 text-center text-gray-500 font-black uppercase tracking-widest animate-pulse">
                    Select a Subject from above to view Study Materials
                </div>
            )}
        </div>
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
    <div className={`bg-[#161d2f] p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:bg-white/[0.02] transition-all duration-500`}>
      <div className={`absolute right-4 md:right-6 top-4 md:top-6 opacity-[0.07] group-hover:opacity-20 group-hover:scale-125 transition-all duration-700 ${textColor}`}>
        <div className="text-3xl md:text-5xl">{icon}</div>
      </div>
      <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-2">{label}</p>
      <h2 className={`text-4xl md:text-6xl font-black tracking-tighter ${textColor} italic`}>{value}</h2>
      {progress !== undefined ? (
        <div className="mt-6 md:mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[7px] md:text-[8px] font-black uppercase text-gray-600 tracking-widest">Performance Track</span>
            <span className="text-[7px] md:text-[8px] font-black uppercase text-green-500 tracking-widest">{progress}%</span>
          </div>
          <div className="w-full bg-black/40 h-1 md:h-1.5 rounded-full overflow-hidden border border-white/5">
            <div className="bg-green-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      ) : (
        <div className="mt-6 md:mt-8 flex items-center gap-2">
          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-gray-800 animate-pulse"></div>
          <p className="text-[7px] md:text-[9px] text-gray-600 font-black uppercase tracking-widest">{subText}</p>
        </div>
      )}
    </div>
  );
}