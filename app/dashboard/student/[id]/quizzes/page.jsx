'use client'
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardList, Play, CheckCircle, Clock, Award, XCircle } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams(); 

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await safeApiCall('/quiz/student/my-quizzes');
      
      console.log("Subhan - Dashboard Data Check:", res); 

      if (res) {
        const data = Array.isArray(res) ? res : (res.data || []);
        setQuizzes(data);
      } else {
        toast.error("Quizzes load nahi ho sakein");
      }
    } catch (err) {
      toast.error("Network error occured");
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
        <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest text-left">
          Lahore Portal: Track your progress and scores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full bg-[#161d2f] p-10 rounded-[2.5rem] text-center border border-white/5">
             <p className="text-gray-500 italic">Abhi tak koi quiz assign nahi kiya gaya.</p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            // ✅ Score aur Completion Logic
            const displayScore = quiz.score ?? quiz.obtained_marks ?? 0;
            const totalMarks = quiz.total_marks || 0; 
            const isCompleted = quiz.is_completed || quiz.status === 'PASS' || quiz.status === 'FAIL';
            const hasPassed = quiz.status === 'PASS';

            return (
              <div key={quiz.assignment_id} className={`bg-[#161d2f] p-6 rounded-[2.5rem] border border-white/5 shadow-xl transition-all group relative overflow-hidden ${isCompleted ? '' : 'hover:border-green-500/30'}`}>
                
                {/* Score Badge - Dynamic Color based on Pass/Fail */}
                {isCompleted && (
                  <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl font-black text-[10px] flex items-center gap-1 shadow-lg z-10 ${hasPassed ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                    <Award size={12} /> SCORE: {displayScore} / {totalMarks}
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-xl ${isCompleted ? (hasPassed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500') : 'bg-yellow-500/10 text-yellow-500'}`}>
                    {isCompleted ? (hasPassed ? <CheckCircle size={20} /> : <XCircle size={20} />) : <Clock size={20} />}
                  </div>
                  {!isCompleted && (
                    <span className="text-[10px] font-black uppercase text-gray-600">Total Marks: {totalMarks}</span>
                  )}
                </div>

                <h3 className={`text-xl font-bold mb-2 transition-colors uppercase ${!isCompleted && 'group-hover:text-green-500'}`}>{quiz.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2 italic">{quiz.description || "No description provided."}</p>
                
                <div className="flex flex-col gap-1 mb-6 bg-[#0a0f1c] p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-black uppercase text-gray-500">Teacher:</span>
                  <span className="text-sm font-bold text-gray-300 uppercase">{quiz.teacher_name || "Assigned Teacher"}</span>
                </div>

                {isCompleted ? (
                  <div className="space-y-3">
                    {/* ✅ DYNAMIC RESULT STATUS BLOCK */}
                    <div className={`p-4 rounded-2xl flex justify-between items-center border ${hasPassed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                       <span className="text-[10px] font-black text-gray-500 uppercase">Result Status</span>
                       <span className={`text-xs font-bold uppercase tracking-tighter ${hasPassed ? 'text-green-500' : 'text-red-500'}`}>
                         {hasPassed ? 'Passed' : 'Failed'}
                       </span>
                    </div>
                    
                    <button disabled className="w-full bg-white/5 text-gray-500 p-4 rounded-2xl font-black uppercase text-[10px] border border-white/5 cursor-not-allowed">
                      QUIZ COMPLETED
                    </button>
                  </div>
                ) : (
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
            );
          })
        )}
      </div>
    </div>
  );
}