'use client'
import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation'; 
import { toast } from 'react-hot-toast';
import axios from 'axios'; 
import { 
  ClipboardList, Users, Eye, X, Award, Calendar, 
  BookOpen, Trash2, List, AlertTriangle, LogOut,
  UserRound, Library, BarChart3, MessageCircle, Search 
} from 'lucide-react';
import Cookies from 'js-cookie'; 

// ✅ Component Imports
import IdentityCard from '@/components/StudentIDCard'; 
import ResourceCenter from '@/components/ResourceCenter'; 
import ChatBox from '@/components/ChatBox'; 


// ✅ Redux Hooks Import
import { 
  useGetTeacherCoursesQuery, 
  useGetTeacherQuizzesQuery, 
  useGetTeacherStatsQuery,
  useDeleteQuizMutation,
  useDeleteCourseTeacherMutation,
  useCreateCourseTeacherMutation,
  useUpdateCourseTeacherMutation,
  useGetQuestionsListQuery,
  useDeleteQuestionMutation,
  useGetQuizResultsQuery,
  useGetAllStudentsQuery 
} from '@/src/lib/redux/apiSlice';

// ✅ MUHAMMAD AHMED: Global URL define kar di hai takay error khatm ho jaye
const WEBURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
console.log(`🌐 Using API Base URL: ${WEBURL} - Please ensure this is correct!`);
// --- 1. QUESTIONS VIEW MODAL ---
function QuestionsModal({ quizId, onClose }) {
  const { data: questions = [], isLoading } = useGetQuestionsListQuery(quizId);
  const [deleteQuestion] = useDeleteQuestionMutation();

  const handleDelete = async (qId) => {
    if (!window.confirm("Kya aap waqai yeh MCQ delete karna chahte hain?")) return;
    try {
      await deleteQuestion(qId).unwrap();
      toast.success("Question deleted!");
    } catch (err) {
      toast.error("Delete fail ho gaya");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <div className="bg-[#161d2f] w-full max-w-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1c253b]">
          <h2 className="text-xl font-black uppercase italic text-blue-400 flex items-center gap-3">
            <List size={22} /> Quiz Content / MCQs
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={24} /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="text-center py-10 animate-pulse font-black text-white uppercase italic">LOADING MCQS...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold uppercase italic">No Questions Found</div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="bg-black/20 p-5 rounded-2xl border border-white/5 relative group">
                <button 
                  onClick={() => handleDelete(q.id)}
                  className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-500/10 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
                <p className="text-blue-500 text-[10px] font-black uppercase mb-1">Question {idx + 1}</p>
                <h4 className="font-bold text-lg mb-4 text-gray-100">{q.question_text}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {JSON.parse(q.options).map((opt, i) => (
                    <div key={i} className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${opt === q.correct_answer ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-white/5 text-gray-500 border border-transparent'}`}>
                       <div className={`w-2 h-2 rounded-full ${opt === q.correct_answer ? 'bg-green-500' : 'bg-gray-700'}`} />
                       {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 bg-black/40 text-center border-t border-white/5">
          <button onClick={onClose} className="text-gray-400 hover:text-white font-black uppercase text-[10px] tracking-widest">Close View</button>
        </div>
      </div>
    </div>
  );
}

// --- 2. RESULTS MODAL ---
function ResultsModal({ quizId, onClose }) {
  const { data: results = [], isLoading } = useGetQuizResultsQuery(quizId);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#161d2f] w-full max-w-4xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1c253b]">
          <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-3">
            <Users className="text-green-500" /> Quiz Performance
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={24} /></button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-10 text-center font-black text-white animate-pulse uppercase italic">Fetching Records...</div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-gray-500 italic uppercase font-bold tracking-widest">No Submissions Found</div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] font-black uppercase text-gray-500 tracking-widest px-4">
                  <th className="pb-4 pl-4">Student</th>
                  <th className="pb-4">Score</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="bg-[#0a0f1c] rounded-xl hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4 rounded-l-xl border-l border-white/5">
                      <div className="font-bold text-gray-200">{r.student_name}</div>
                      <div className="text-[10px] text-gray-600 font-mono">{r.student_email}</div>
                    </td>
                    <td className="py-4 font-black text-white italic">{r.score} / {r.total_marks}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black ${r.status === 'PASS' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 rounded-r-xl text-[10px] text-gray-500 italic border-r border-white/5">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// --- 3. MAIN DASHBOARD ---
export default function TeacherDashboard() {
  const router = useRouter(); 
  const { data: coursesData, isLoading: coursesLoading } = useGetTeacherCoursesQuery();
  const { data: quizzes = [], isLoading: quizzesLoading } = useGetTeacherQuizzesQuery();
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useGetTeacherStatsQuery();
  const { data: allStudentsData = [], refetch: refetchStudents } = useGetAllStudentsQuery(); 

  const [deleteQuiz] = useDeleteQuizMutation();
  const [deleteCourse] = useDeleteCourseTeacherMutation();
  const [createCourse] = useCreateCourseTeacherMutation();
  const [updateCourse] = useUpdateCourseTeacherMutation();

  const [selectedQuizId, setSelectedQuizId] = useState(null); 
  const [viewQuestionsId, setViewQuestionsId] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false); 
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // ✅ MUHAMMAD AHMED: States for Private Chat
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const myCourses = coursesData?.data || [];
  const teacherId = Cookies.get('userId'); 

  // ✅ MUHAMMAD AHMED: Mark as Read Logic
  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    try {
        await axios.put(`${WEBURL}/api/teacher/chat/mark-read/${student.id}`, {}, {
            headers: { 'Authorization': `Bearer ${Cookies.get('token')}` }
        });
        
        refetchStats();
        refetchStudents();
    } catch (err) {
        console.error("Mark read error:", err);
    }
};

  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('token'); 
    Cookies.remove('role');
    localStorage.clear();
    toast.success("Logging out...");
    window.location.href = '/login';
  };

  const handleDeleteQuizAction = async (quizId) => {
    if (!window.confirm("WARNING: Poora quiz delete kar dein?")) return;
    try {
      await deleteQuiz(quizId).unwrap();
      toast.success("Quiz deleted successfully!");
    } catch (err) {
      toast.error("Delete fail ho gaya");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse({ id: editingCourse.id, ...formData }).unwrap();
      } else {
        await createCourse(formData).unwrap();
      }
      toast.success("✅ Success!");
      setShowModal(false);
    } catch (err) { toast.error("Server error."); }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleNewMessage = () => {
    // Refresh student list and stats to show new unread counts
    refetchStudents();
    refetchStats();
  };

  // ✅ Logic to generate unique room ID: Example "31_45"
  const getPrivateRoomId = (studentId) => {
    if (!teacherId || !studentId) return "GLOBAL_ROOM";
    const sortedIds = [String(teacherId), String(studentId)].sort();
    return sortedIds.join("_");
  };

  // Student filtering logic
  const studentList = allStudentsData?.data || allStudentsData;
  const filteredStudents = Array.isArray(studentList) 
    ? studentList.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  if (coursesLoading || quizzesLoading || statsLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="p-10 text-blue-500 text-2xl font-bold animate-pulse italic uppercase">Lahore Portal Loading...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto text-white space-y-10 font-sans relative">
      {selectedQuizId && <ResultsModal quizId={selectedQuizId} onClose={() => setSelectedQuizId(null)} />}
      {viewQuestionsId && <QuestionsModal quizId={viewQuestionsId} onClose={() => setViewQuestionsId(null)} />}
      
      <IdentityCard 
        user={{ id: teacherId, name: statsData?.teacherName, role: 'teacher' }}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Teacher <span className="text-blue-500">Panel</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Lahore Portal | Management Dashboard</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={toggleChat}
            className={`relative flex items-center gap-2 ${isChatOpen ? 'bg-green-500 text-black' : 'bg-green-500/10 text-green-500'} border border-green-500/20 px-6 py-3 rounded-2xl transition-all shadow-xl`}
          >
            <MessageCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isChatOpen ? 'Close Chat' : 'Student Messages'}</span>
            
            {/* ✅ Muhammad Ahmed: Main Button Badge - Showing total global unread */}
            {statsData?.totalUnreadMessages > 0 && !isChatOpen && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#0f172a] animate-bounce">
                {statsData.totalUnreadMessages}
              </span>
            )}
          </button>

          <button onClick={() => router.push('/reports')} className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-600 border border-blue-500/20 px-6 py-3 rounded-2xl transition-all group shadow-xl">
            <BarChart3 className="text-blue-500 group-hover:text-white" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 group-hover:text-white">Analytics</span>
          </button>

          <button onClick={() => setIsIdCardOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl transition-all group shadow-xl">
            <UserRound className="text-gray-400 group-hover:text-white" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">My ID Card</span>
          </button>

          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 px-6 py-3 rounded-2xl transition-all group shadow-xl">
            <LogOut className="text-red-500 group-hover:text-white" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 group-hover:text-white">Logout</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Teacher Name</p>
          <h3 className="font-black text-lg text-blue-400 italic">{statsData?.teacherName || 'Teacher'}</h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl font-black text-2xl text-purple-400">
           <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Subjects</p>
           {statsData?.totalSubjects || 0}
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl font-black text-2xl text-green-400">
           <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Students</p>
           {statsData?.totalStudents || 0}
        </div>
        <button onClick={() => { setEditingCourse(null); setFormData({title:'', description:''}); setShowModal(true); }} className="bg-[#161d2f] p-6 rounded-2xl border border-orange-500/30 border-dashed flex items-center justify-center text-orange-400 font-black uppercase text-xs hover:bg-orange-500/10 transition-all shadow-xl">
          + Add New Subject
        </button>
      </div>

      {/* ✅ UPGRADED CHAT SYSTEM */}
      {isChatOpen && (
        <div className="animate-in slide-in-from-top-4 duration-500">
           <div className="flex flex-col md:flex-row h-[600px] bg-[#161d2f] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
             
             {/* --- SIDEBAR: Students List --- */}
             <div className="w-full md:w-1/3 border-r border-white/5 flex flex-col bg-black/20">
               <div className="p-6 border-b border-white/5">
                 <h3 className="text-sm font-black italic text-blue-400 uppercase tracking-widest mb-4">Registered Students</h3>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                   <input 
                     type="text" 
                     placeholder="Search student..." 
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500/50"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                 {filteredStudents.length > 0 ? (
                   filteredStudents.map((std) => (
                     <div 
                       key={std.id}
                       onClick={() => handleStudentClick(std)}
                       className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${selectedStudent?.id === std.id ? 'bg-blue-600 shadow-lg shadow-blue-600/20' : 'hover:bg-white/5'}`}
                     >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-black text-xs overflow-hidden">
                            {std.profile_pic ? (
                                <img src={std.profile_pic} alt="pic" className="w-full h-full object-cover" />
                            ) : (
                                <span>{std.name?.charAt(0)}</span>
                            )}
                            </div>
                            <div>
                            <p className={`text-sm font-bold uppercase ${selectedStudent?.id === std.id ? 'text-white' : 'text-gray-300'}`}>{std.name}</p>
                            <p className="text-[9px] opacity-50 italic uppercase tracking-tighter">ID: {std.id}</p>
                            </div>
                        </div>

                        {/* ✅ Muhammad Ahmed: Student List Badge - Showing unread count for each student */}
                        {parseInt(std.unread_count) > 0 && selectedStudent?.id !== std.id && (
                             <div className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse">
                                {std.unread_count}
                             </div>
                        )}
                     </div>
                   ))
                 ) : (
                   <p className="text-center text-[10px] text-gray-600 mt-10 uppercase font-black">No students found</p>
                 )}
               </div>
             </div>

             {/* --- MAIN: Private Chat Box --- */}
             <div className="flex-1 flex flex-col relative bg-black/10">
               {selectedStudent ? (
                 <ChatBox 
                   roomId={getPrivateRoomId(selectedStudent.id)}
                   userId={teacherId}
                   userName={statsData?.teacherName || "Teacher"}
                   userRole="teacher"
                   receiverId={selectedStudent.id}
                   receiverName={selectedStudent.name}
                   onNewMessage={handleNewMessage}
                 />
               ) : (
                 <div className="m-auto text-center opacity-20">
                   <MessageCircle size={60} className="mx-auto mb-4" />
                   <p className="text-xs font-black uppercase tracking-[0.3em]">Select a student to start a private conversation</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      )}

      {/* Resource Center */}
      <div className="mt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20"><Library className="text-blue-500" size={20} /></div>
          <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Study Material Center</h2>
        </div>
        <div className="bg-[#161d2f]/50 rounded-[2.5rem] border border-white/5 p-2 backdrop-blur-md">
          {myCourses.length > 0 ? (
            <ResourceCenter courseId={myCourses[0].id} userRole="teacher" userId={teacherId} />
          ) : (
            <div className="py-20 text-center text-gray-500 font-black uppercase tracking-widest">Add a subject to upload resources.</div>
          )}
        </div>
      </div>

      {/* TABLE 1: Subjects */}
      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl mt-10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <BookOpen className="text-blue-500" size={20} /> My Managed Subjects
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <tr><th className="p-5">Subject Name</th><th className="p-5">Description</th><th className="p-5 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {myCourses.map((course) => (
                <tr key={course.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-5 font-bold text-blue-300 italic uppercase">{course.name || course.title}</td>
                  <td className="p-5 text-gray-400 text-sm max-w-[300px] truncate">{course.description || "No description."}</td>
                  <td className="p-5 text-right space-x-4">
                    <button onClick={() => { setEditingCourse(course); setFormData({title: course.name || course.title, description: course.description}); setShowModal(true); }} className="text-blue-400 hover:text-blue-200 font-black text-[10px] uppercase">Edit</button>
                    <button onClick={() => deleteCourse(course.id)} className="text-red-500 hover:text-red-300 font-black text-[10px] uppercase">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: Quizzes */}
      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl mt-10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <ClipboardList className="text-green-500" size={20} /> My Managed Quizzes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <tr><th className="p-5">Quiz Title</th><th className="p-5 text-center">Marks</th><th className="p-5 text-right">Performance</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-white/5 transition-all">
                  <td className="p-5 font-bold text-green-300 italic uppercase">{quiz.title}</td>
                  <td className="p-5 text-center font-black text-xl text-white">{quiz.total_marks}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setViewQuestionsId(quiz.id)} className="bg-blue-600 text-white px-3 py-2 rounded-xl font-black uppercase text-[10px]">MCQs</button>
                      <button onClick={() => setSelectedQuizId(quiz.id)} className="bg-green-500 text-black px-3 py-2 rounded-xl font-black uppercase text-[10px]">Results</button>
                      <button onClick={() => handleDeleteQuizAction(quiz.id)} className="bg-red-500/10 text-red-500 px-3 py-2 rounded-xl font-black uppercase text-[10px] border border-red-500/20">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FOR SUBJECTS */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-md">
          <div className="bg-[#161d2f] border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white italic uppercase">{editingCourse ? 'Edit Subject' : 'Add New Subject'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-[10px] uppercase font-black text-gray-500">Subject Title</label>
              <input type="text" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mt-1 text-sm outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required /></div>
              <div><label className="text-[10px] uppercase font-black text-gray-500">Description</label>
              <textarea className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mt-1 h-28 text-sm outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/5 py-4 rounded-xl font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 py-4 rounded-xl font-black text-xs">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Styles for Scrollbar */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}