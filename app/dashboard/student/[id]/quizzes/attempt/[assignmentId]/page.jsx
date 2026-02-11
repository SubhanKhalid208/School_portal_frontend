'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Clock, Send, ChevronRight, ChevronLeft } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api';

export default function AttemptQuizPage() {
  const params = useParams();
  const assignmentId = params?.assignmentId; 
  const studentId = params?.id; 
  const router = useRouter();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(600); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentId) {
      loadQuestions();
    }
  }, [assignmentId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); 
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadQuestions = async () => {
    try {
      const data = await safeApiCall(`/quiz/questions/${assignmentId}`);
      console.log("Subhan, API Response:", data); 

      if (data) {
        // ✅ CRITICAL FIX: Backend se agar single object aaye to use array mein convert karo
        const questionsArray = Array.isArray(data) ? data : [data];
        
        // Filter out any null values just in case
        const validQuestions = questionsArray.filter(q => q && q.id);
        
        if (validQuestions.length > 0) {
          setQuestions(validQuestions);
        } else {
          toast.error("No valid questions found");
        }
      }
    } catch (err) {
      console.error("Load Error:", err);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId, option) => {
    setAnswers({ ...answers, [qId]: option });
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(answers).map(qId => ({
      question_id: parseInt(qId),
      selected: answers[qId]
    }));

    if (formattedAnswers.length === 0 && timeLeft > 0) {
      toast.error("Please select at least one answer!");
      return;
    }

    try {
      const res = await safeApiCall('/quiz/student/submit', {
        method: 'POST',
        body: JSON.stringify({ 
          assignment_id: parseInt(assignmentId), 
          answers: formattedAnswers 
        }),
      });

      if (res) {
        toast.success(`Quiz Submitted! Score: ${res.score || 0}`);
        router.push(`/dashboard/student/${studentId}/quizzes`);
      }
    } catch (err) {
      toast.error("Submission failed!");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
      <div className="text-green-500 animate-pulse text-2xl font-black italic tracking-tighter">
        PREPARING YOUR QUIZ...
      </div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="min-h-screen bg-[#0a0f1c] text-white flex flex-col items-center justify-center gap-4">
      <p className="opacity-50">No questions found.</p>
      <button onClick={() => router.back()} className="text-green-400 underline">Go Back</button>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-4 md:p-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 bg-[#161d2f] p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="font-black uppercase text-[10px] tracking-widest">Lahore Portal | Live Quiz</span>
        </div>
        <div className="flex items-center gap-3 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20">
          <Clock size={16} />
          <span className="font-mono font-bold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto bg-[#161d2f] p-6 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <span className="text-gray-500 font-bold text-[10px] uppercase">Question {currentIndex + 1} of {questions.length}</span>
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-[10px] font-black">MARKS: {currentQ?.marks || 1}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-tight">
          {currentQ?.question_text}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {['a', 'b', 'c', 'd'].map((opt) => {
            const val = currentQ[`option_${opt}`];
            if (!val) return null; // Skip if option is empty

            return (
              <button
                key={opt}
                onClick={() => handleOptionSelect(currentQ.id, opt.toUpperCase())}
                className={`p-6 rounded-2xl border transition-all text-left flex items-center gap-4 ${
                  answers[currentQ.id] === opt.toUpperCase() 
                  ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.1)]' 
                  : 'border-white/5 bg-[#0a0f1c] hover:border-white/10'
                }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                  answers[currentQ.id] === opt.toUpperCase() ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-500'
                }`}>
                  {opt.toUpperCase()}
                </span>
                <span className="text-lg font-semibold">{val}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-8">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white disabled:opacity-20 font-black uppercase text-[10px]"
          >
            <ChevronLeft size={20} /> Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-black px-10 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-xl"
            >
              <Send size={16} /> Finish Quiz
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex items-center gap-2 text-green-500 font-black uppercase text-[10px]"
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}