'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ClipboardList, Users, Eye, X, Award, Calendar, 
  BookOpen, Trash2, List, AlertTriangle, LogOut,
  UserRound // ✅ ID Card icon ke liye
} from 'lucide-react';
import Cookies from 'js-cookie'; 

// ✅ IdentityCard Component Import (Path apne mutabiq check karlein)
import IdentityCard from '@/components/StudentIDCard'; 

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
  useGetQuizResultsQuery
} from '@/src/lib/redux/apiSlice';

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
  // ✅ Redux Queries
  const { data: coursesData, isLoading: coursesLoading } = useGetTeacherCoursesQuery();
  const { data: quizzes = [], isLoading: quizzesLoading } = useGetTeacherQuizzesQuery();
  const { data: statsData, isLoading: statsLoading } = useGetTeacherStatsQuery();

  // ✅ Redux Mutations
  const [deleteQuiz] = useDeleteQuizMutation();
  const [deleteCourse] = useDeleteCourseTeacherMutation();
  const [createCourse] = useCreateCourseTeacherMutation();
  const [updateCourse] = useUpdateCourseTeacherMutation();

  const [selectedQuizId, setSelectedQuizId] = useState(null); 
  const [viewQuestionsId, setViewQuestionsId] = useState(null); 
  const [showModal, setShowModal] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false); // ✅ ID Card State
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const myCourses = coursesData?.data || [];

  // ✅ Logout Handler
  const handleLogout = () => {
    Cookies.remove('userId');
    Cookies.remove('token'); 
    Cookies.remove('role');
    localStorage.clear();
    toast.success("Logging out from Teacher Panel...");
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

  if (coursesLoading || quizzesLoading || statsLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
        <div className="p-10 text-blue-500 text-2xl font-bold animate-pulse italic uppercase">Lahore Portal Loading...</div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto text-white space-y-10">
      {selectedQuizId && <ResultsModal quizId={selectedQuizId} onClose={() => setSelectedQuizId(null)} />}
      {viewQuestionsId && <QuestionsModal quizId={viewQuestionsId} onClose={() => setViewQuestionsId(null)} />}
      
      {/* ✅ ID Card Component Integration */}
      <IdentityCard 
        user={{
          id: Cookies.get('userId'),
          name: statsData?.teacherName,
          role: 'teacher' 
        }}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />

      {/* Header with Title and Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Teacher <span className="text-blue-500">Panel</span>
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Lahore Portal | Management Dashboard</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* ✅ ID Card Button */}
          <button 
            onClick={() => setIsIdCardOpen(true)}
            className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500 border border-green-500/20 px-6 py-3 rounded-2xl transition-all group shadow-xl"
          >
            <UserRound className="text-green-500 group-hover:text-white transition-transform" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white text-green-500">My ID Card</span>
          </button>

          {/* ✅ Integrated Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-600 px-6 py-3 rounded-2xl transition-all group shadow-xl"
          >
            <LogOut className="text-red-500 group-hover:text-white transition-transform" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white text-red-500">Logout</span>
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl transition-transform hover:scale-105">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Teacher Name</p>
          <h3 className="font-black text-lg text-blue-400 italic">{statsData?.teacherName || 'Teacher'}</h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Total Subjects</p>
          <h3 className="font-black text-2xl text-purple-400">{statsData?.totalSubjects || 0}</h3>
        </div>
        <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 shadow-xl">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Total Students</p>
          <h3 className="font-black text-2xl text-green-400">{statsData?.totalStudents || 0}</h3>
        </div>
        <button 
          onClick={() => { setEditingCourse(null); setFormData({title:'', description:''}); setShowModal(true); }}
          className="bg-[#161d2f] p-6 rounded-2xl border border-orange-500/30 border-dashed flex items-center justify-center text-orange-400 font-black uppercase text-xs hover:bg-orange-500/10 transition-all shadow-xl"
        >
          + Add New Subject
        </button>
      </div>

      {/* TABLE 1: SUBJECTS */}
      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <BookOpen className="text-blue-500" size={20} /> My Managed Subjects
          </h2>
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
              {myCourses.map((course) => (
                <tr key={course.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-5 font-bold text-blue-300 group-hover:text-blue-100 italic uppercase">{course.name || course.title}</td>
                  <td className="p-5 text-gray-400 text-sm max-w-[300px] truncate">{course.description || "No description provided."}</td>
                  <td className="p-5 text-right space-x-4">
                    <button onClick={() => { setEditingCourse(course); setFormData({title: course.name || course.title, description: course.description}); setShowModal(true); }} className="text-blue-400 hover:text-blue-200 font-black text-[10px] uppercase transition-colors">Edit</button>
                    <button onClick={() => deleteCourse(course.id)} className="text-red-500 hover:text-red-300 font-black text-[10px] uppercase transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: QUIZZES */}
      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <ClipboardList className="text-green-500" size={20} /> My Managed Quizzes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-gray-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-5">Quiz Title</th>
                <th className="p-5 text-center">Total Marks</th>
                <th className="p-5 text-right">Management & Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-white/5 transition-all group">
                  <td className="p-5 font-bold text-green-300 italic uppercase">{quiz.title}</td>
                  <td className="p-5 text-center font-black text-xl text-white">{quiz.total_marks}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <button onClick={() => setViewQuestionsId(quiz.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl font-black uppercase text-[10px] flex items-center gap-2">
                        <List size={14} /> MCQs
                      </button>
                      <button onClick={() => setSelectedQuizId(quiz.id)} className="bg-green-500 hover:bg-green-400 text-black px-3 py-2 rounded-xl font-black uppercase text-[10px] flex items-center gap-2">
                        <Eye size={14} /> Results
                      </button>
                      <button onClick={() => handleDeleteQuizAction(quiz.id)} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 border border-red-500/20 transition-all">
                        <Trash2 size={14} /> Delete
                      </button>
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
            <h2 className="text-2xl font-black mb-6 text-white italic uppercase tracking-tighter">{editingCourse ? 'Edit Subject' : 'Add New Subject'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Subject Title</label>
                <input type="text" className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mt-1 outline-none text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Description</label>
                <textarea className="w-full bg-black/40 border border-white/10 p-4 rounded-xl mt-1 outline-none h-28 text-sm" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
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