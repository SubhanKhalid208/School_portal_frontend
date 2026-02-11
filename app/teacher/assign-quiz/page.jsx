'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserCheck, Search, BookOpen } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api';

export default function AssignQuizPage() {
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Quizzes (Backend fix ke baad res.data mein array aayega)
      const quizRes = await safeApiCall('/quiz/all'); 
      if (quizRes.success) {
        setQuizzes(quizRes.data || []);
      } else {
        toast.error("Quizzes load nahi ho sakein");
      }

      // 2. Fetch Students
      const userRes = await safeApiCall('/auth/users?role=student');
      if (userRes.success) {
        setStudents(userRes.data || []);
      }
    } catch (err) {
      toast.error("Data load karne mein masla hua");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (studentId) => {
    if (!selectedQuiz) {
      toast.error("Pehle ek Quiz select karein!");
      return;
    }

    try {
      // Backend ko correct payload bhejna
      const res = await safeApiCall('/quiz/teacher/assign', {
        method: 'POST',
        body: JSON.stringify({
          quiz_id: selectedQuiz,
          student_id: studentId
        }),
      });

      if (res.success) {
        toast.success("Quiz assign kar diya gaya!");
      } else {
        toast.error(res.error || "Assign karne mein masla hua");
      }
    } catch (err) {
      toast.error("Network error: Assign nahi ho saka");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <UserCheck className="text-green-500" /> Assign Quiz
          </h1>
          <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">
            Select a quiz and assign it to students in Lahore
          </p>
        </div>

        {/* Quiz Selector */}
        <div className="bg-[#161d2f] p-2 rounded-2xl border border-white/5 flex items-center gap-3">
          <BookOpen size={18} className="ml-2 text-green-500" />
          <select 
            className="bg-transparent outline-none text-sm font-bold pr-4 py-2 text-white"
            value={selectedQuiz}
            onChange={(e) => setSelectedQuiz(e.target.value)}
          >
            <option value="" className="bg-[#161d2f]">Select Quiz to Assign</option>
            {quizzes.map(q => (
              <option key={q.id} value={q.id} className="bg-[#161d2f]">{q.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text"
          placeholder="Search students by name or email..."
          className="w-full bg-[#161d2f] border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-green-500 transition-all shadow-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Students List Table */}
      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-48 font-bold italic animate-pulse">Loading Students...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="p-6">Student Name</th>
                <th className="p-6">Email Address</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students
                .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
                .map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center font-black text-black">
                          {student.name ? student.name[0].toUpperCase() : '?'}
                        </div>
                        <span className="font-bold">{student.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-gray-400 text-sm font-medium">{student.email}</td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleAssign(student.id)}
                        className="bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
                      >
                        Assign Now
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}