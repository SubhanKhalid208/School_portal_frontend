'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, Trash2, Save, LayoutList, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
// ✅ Redux Hooks Import
import { 
  useCreateQuizMutation, 
  useGetTeacherCoursesQuery 
} from '@/src/lib/redux/apiSlice';

export default function CreateQuizPage() {
  const router = useRouter();
  const { data: coursesData } = useGetTeacherCoursesQuery();
  const [createQuiz, { isLoading: isSaving }] = useCreateQuizMutation();

  const courses = coursesData?.data || [];

  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    passing_marks: 5,
    courseId: '', // Course selection lazmi hai
  });

  const [questions, setQuestions] = useState([
    { text: '', a: '', b: '', c: '', d: '', correct: 'A', marks: 1 }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', a: '', b: '', c: '', d: '', correct: 'A', marks: 1 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast.error("Kam az kam ek sawal lazmi hai!");
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!quizInfo.title || !quizInfo.courseId) {
      toast.error("Quiz title aur Subject select karna lazmi hai!");
      return;
    }

    if (questions.some(q => !q.text || !q.a || !q.b)) {
      toast.error("Tamam sawalat aur kam az kam 2 options fill karein!");
      return;
    }

    try {
      // ✅ DATA MAPPING for Backend
      const formattedQuestions = questions.map(q => ({
        question_text: q.text,
        option_a: q.a,
        option_b: q.b,
        option_c: q.c,
        option_d: q.d,
        correct_option: q.correct,
        marks: q.marks || 1
      }));

      const payload = {
        ...quizInfo,
        questions: formattedQuestions
      };

      await createQuiz(payload).unwrap();

      toast.success("✅ Quiz successfully create ho gaya!");
      router.push('/teacher'); // Wapis dashboard pe bhej do
    } catch (err) {
      toast.error(err?.data?.message || "Quiz save nahi ho saka!");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <LayoutList className="text-green-500" size={32} />
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Create New Quiz</h1>
        </div>
        <span className="text-[10px] bg-green-500/10 text-green-500 px-4 py-1 rounded-full border border-green-500/20 font-black uppercase italic">
          Lahore Quiz Center
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Basic Info */}
        <div className="bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Quiz Title</label>
              <input 
                type="text" 
                className="bg-[#0a0f1c] border border-white/5 p-4 rounded-xl focus:border-green-500 outline-none transition-all font-bold"
                placeholder="e.g. Mid-Term Exam"
                value={quizInfo.title}
                onChange={(e) => setQuizInfo({...quizInfo, title: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Select Subject</label>
              <select 
                className="bg-[#0a0f1c] border border-white/5 p-4 rounded-xl focus:border-green-500 outline-none transition-all font-bold text-gray-300"
                value={quizInfo.courseId}
                onChange={(e) => setQuizInfo({...quizInfo, courseId: e.target.value})}
              >
                <option value="">-- Choose Subject --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name || c.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description (Optional)</label>
              <input 
                type="text" 
                className="bg-[#0a0f1c] border border-white/5 p-4 rounded-xl focus:border-green-500 outline-none transition-all"
                placeholder="Brief details about quiz..."
                value={quizInfo.description}
                onChange={(e) => setQuizInfo({...quizInfo, description: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Passing Marks</label>
              <input 
                type="number" 
                className="bg-[#0a0f1c] border border-white/5 p-4 rounded-xl focus:border-green-500 outline-none font-black text-green-500"
                value={quizInfo.passing_marks}
                onChange={(e) => setQuizInfo({...quizInfo, passing_marks: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index} className="bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 relative group transition-all hover:border-green-500/20 shadow-xl">
              <div className="absolute -left-3 top-8 bg-green-500 text-black font-black w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                {index + 1}
              </div>
              
              <button 
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute right-6 top-6 text-gray-600 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 size={20} />
              </button>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-gray-600 tracking-tighter">Write Question</label>
                  <input 
                    type="text"
                    placeholder="E.g. What is the capital of Pakistan?"
                    className="w-full bg-transparent text-xl font-bold border-b-2 border-white/5 pb-2 focus:border-green-500 outline-none transition-all placeholder:text-gray-700"
                    value={q.text}
                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${q.correct === opt.toUpperCase() ? 'bg-green-500/10 border-green-500/40' : 'bg-[#0a0f1c] border-white/5'}`}>
                      <span className={`uppercase font-black ${q.correct === opt.toUpperCase() ? 'text-green-500' : 'text-gray-600'}`}>{opt}:</span>
                      <input 
                        type="text"
                        className="bg-transparent w-full outline-none text-sm font-bold"
                        placeholder={`Option ${opt.toUpperCase()}`}
                        value={q[opt]}
                        onChange={(e) => handleQuestionChange(index, opt, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-6 bg-black/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] font-black uppercase text-gray-500">Correct Answer:</label>
                    <select 
                      className="bg-[#161d2f] border border-green-500/30 rounded-lg px-6 py-2 text-green-500 font-black outline-none"
                      value={q.correct}
                      onChange={(e) => handleQuestionChange(index, 'correct', e.target.value)}
                    >
                      {['A', 'B', 'C', 'D'].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <label className="text-[10px] font-black uppercase text-gray-500">Marks:</label>
                    <input 
                      type="number"
                      className="bg-transparent w-12 font-black text-white outline-none"
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(index, 'marks', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col md:flex-row gap-4 pb-20 mt-10">
          <button 
            type="button"
            onClick={addQuestion}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
          >
            <PlusCircle size={22} className="text-green-500" /> Add Question
          </button>
          <button 
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-green-500 hover:bg-green-600 text-black p-5 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all shadow-[0_15px_40px_rgba(34,197,94,0.3)] hover:scale-[1.02] disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <><Save size={22} /> Save Quiz to Portal</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}