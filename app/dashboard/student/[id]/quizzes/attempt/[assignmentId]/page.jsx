'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Clock, Send, ChevronRight, ChevronLeft } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api';

export default function AttemptQuizPage() {
  const { assignmentId } = useParams(); 
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // {question_id: 'A'}
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // Timer khatam hone par auto-submit
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadQuestions = async () => {
    try {
      const data = await safeApiCall(`/quiz/questions/${id}`);
      setQuestions(data);
    } catch (err) {
      toast.error("Questions load nahi ho sakay");
      router.push('/student/quizzes');
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

    try {
      const res = await safeApiCall('/quiz/student/submit', {
        method: 'POST',
        body: JSON.stringify({ assignment_id: id, answers: formattedAnswers }),
      });

      if (res.success) {
        toast.success(`Quiz Submitted! Score: ${res.score}`);
        router.push('/student/quizzes');
      }
    } catch (err) {
      toast.error("Submission failed!");
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic">Preparing Quiz...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white p-6">
      {/* Header with Timer */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10 bg-[#161d2f] p-4 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-black uppercase text-xs tracking-widest">Live Quiz Attempt</span>
        </div>
        <div className="flex items-center gap-3 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl border border-red-500/20">
          <Clock size={18} />
          <span className="font-mono font-bold">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto bg-[#161d2f] p-10 rounded-[3rem] border border-white/5 shadow-inner relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
          <span className="text-gray-500 font-black text-xs uppercase italic">Question {currentIndex + 1} of {questions.length}</span>
          <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Points: {currentQ?.marks}</span>
        </div>

        <h2 className="text-2xl font-bold mb-10 leading-tight">
          {currentQ?.question_text}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {['a', 'b', 'c', 'd'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionSelect(currentQ.id, opt.toUpperCase())}
              className={`p-5 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                answers[currentQ.id] === opt.toUpperCase() 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-white/5 bg-[#0a0f1c] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black transition-all ${
                  answers[currentQ.id] === opt.toUpperCase() ? 'bg-green-500 text-black' : 'bg-white/5 text-gray-500 group-hover:bg-white/10'
                }`}>
                  {opt.toUpperCase()}
                </span>
                <span className="font-medium">{currentQ[`option_${opt}`]}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center border-t border-white/5 pt-8">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="flex items-center gap-2 text-gray-500 hover:text-white disabled:opacity-30 transition-all font-black uppercase text-xs"
          >
            <ChevronLeft size={20} /> Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-black px-8 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-[0_10px_30px_rgba(34,197,94,0.3)]"
            >
              <Send size={16} /> Finish Quiz
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-all font-black uppercase text-xs"
            >
              Next Question <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}