'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, Trash2, Save, HelpCircle, LayoutList } from 'lucide-react';
import { safeApiCall } from '@/app/utils/api';

export default function CreateQuizPage() {
  const [quizInfo, setQuizInfo] = useState({
    title: '',
    description: '',
    subject_id: '',
    passing_marks: 50,
    total_marks: 100
  });

  const [questions, setQuestions] = useState([
    { text: '', a: '', b: '', c: '', d: '', correct: 'A', marks: 1 }
  ]);

  const [loading, setLoading] = useState(false);

  // Naya sawal add karne ka function
  const addQuestion = () => {
    setQuestions([...questions, { text: '', a: '', b: '', c: '', d: '', correct: 'A', marks: 1 }]);
  };

  // Sawal delete karne ka function
  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Input change handle karna
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizInfo.title || questions.some(q => !q.text)) {
      toast.error("Please fill all details and questions!");
      return;
    }

    try {
      setLoading(true);
      const res = await safeApiCall('/quiz/teacher/create', {
        method: 'POST',
        body: JSON.stringify({ ...quizInfo, questions }),
      });

      if (res.success) {
        toast.success("Quiz created successfully!");
        // Reset form
        setQuizInfo({ title: '', description: '', subject_id: '', passing_marks: 50, total_marks: 100 });
        setQuestions([{ text: '', a: '', b: '', c: '', d: '', correct: 'A', marks: 1 }]);
      }
    } catch (err) {
      toast.error("Error creating quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <div className="flex items-center gap-4 mb-8">
        <LayoutList className="text-green-500" size={32} />
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Create New Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Info Section */}
        <div className="bg-[#161d2f] p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quiz Title</label>
              <input 
                type="text" 
                className="bg-[#0a0f1c] border border-white/5 p-3 rounded-xl focus:border-green-500 outline-none transition-all"
                placeholder="e.g. Midterm Mathematics"
                value={quizInfo.title}
                onChange={(e) => setQuizInfo({...quizInfo, title: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Passing Marks</label>
              <input 
                type="number" 
                className="bg-[#0a0f1c] border border-white/5 p-3 rounded-xl focus:border-green-500 outline-none"
                value={quizInfo.passing_marks}
                onChange={(e) => setQuizInfo({...quizInfo, passing_marks: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index} className="bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 relative group">
              <div className="absolute -left-3 top-8 bg-green-500 text-black font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                {index + 1}
              </div>
              
              <button 
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute right-6 top-6 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>

              <div className="space-y-4">
                <input 
                  type="text"
                  placeholder="Enter your question here..."
                  className="w-full bg-transparent text-xl font-bold border-b border-white/10 pb-2 focus:border-green-500 outline-none"
                  value={q.text}
                  onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} className="flex items-center gap-3 bg-[#0a0f1c] p-3 rounded-2xl border border-white/5">
                      <span className="uppercase font-black text-green-500">{opt}:</span>
                      <input 
                        type="text"
                        className="bg-transparent w-full outline-none text-sm"
                        placeholder={`Option ${opt.toUpperCase()}`}
                        value={q[opt]}
                        onChange={(e) => handleQuestionChange(index, opt, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <label className="text-[10px] font-black uppercase text-gray-500">Correct Answer:</label>
                  <select 
                    className="bg-[#0a0f1c] border border-white/5 rounded-lg px-4 py-1 text-green-500 font-bold"
                    value={q.correct}
                    onChange={(e) => handleQuestionChange(index, 'correct', e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 pb-20">
          <button 
            type="button"
            onClick={addQuestion}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all"
          >
            <PlusCircle size={20} /> Add Question
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-600 text-black p-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)]"
          >
            {loading ? "Saving..." : <><Save size={20} /> Save Quiz</>}
          </button>
        </div>
      </form>
    </div>
  );
}