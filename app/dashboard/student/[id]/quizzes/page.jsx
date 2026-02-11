'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardList, Play, CheckCircle, Clock } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams(); // URL se student ID lene ke liye

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      // ✅ API call ke baad .data check karna zaroori hai
      const res = await safeApiCall('/quiz/student/my-quizzes');
      
      if (res.success) {
        setQuizzes(res.data || []);
      } else {
        toast.error(res.error || "Quizzes load nahi ho sakein");
      }
    } catch (err) {
      toast.error("Network error: Quizzes load karne mein masla hua");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-black uppercase italic text-white animate-pulse">
      Loading Quizzes...
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
          <ClipboardList className="text-green-500" /> My Assigned Quizzes
        </h1>
        <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">
          Lahore Portal: Attempt your exams and check results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full bg-[#161d2f] p-10 rounded-[2.5rem] text-center border border-white/5">
             <p className="text-gray-500 italic">Abhi tak koi quiz assign nahi kiya gaya.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.assignment_id} className="bg-[#161d2f] p-6 rounded-[2.5rem] border border-white/5 shadow-xl hover:border-green-500/30 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${quiz.is_completed ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  {quiz.is_completed ? <CheckCircle size={20} /> : <Clock size={20} />}
                </div>
                <span className="text-[10px] font-black uppercase text-gray-600">Marks: {quiz.total_marks}</span>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">{quiz.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{quiz.description || "No description provided."}</p>
              
              <div className="flex flex-col gap-1 mb-6">
                <span className="text-[10px] font-black uppercase text-gray-500">Teacher:</span>
                <span className="text-sm font-bold text-gray-300">{quiz.teacher_name || "Assigned Teacher"}</span>
              </div>

              {quiz.is_completed ? (
                <button disabled className="w-full bg-white/5 text-gray-500 p-4 rounded-2xl font-black uppercase text-[10px] cursor-not-allowed">
                  Completed
                </button>
              ) : (
                /* ✅ Link ko aapke folder structure se match kiya: /dashboard/student/[id]/quizzes/attempt/[assignmentId] */
                <Link 
                  href={`/dashboard/student/${params.id}/quizzes/attempt/${quiz.assignment_id}`} 
                  className="block"
                >
                  <button className="w-full bg-green-500 hover:bg-green-600 text-black p-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_10px_20px_rgba(34,197,94,0.2)]">
                    <Play size={16} fill="currentColor" /> Start Quiz
                  </button>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}