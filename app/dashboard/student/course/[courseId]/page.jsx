"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, Layout, CheckCircle, AlertCircle } from 'lucide-react';

const SubjectDetailPage = () => {
  const { courseId } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Muhammad Ahmed, ID yahan se pick ho rahi hai
        const studentId = localStorage.getItem('userId') || '32'; 
        const token = localStorage.getItem('token');
        const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        const response = await fetch(`${backendURL}/api/student/subject-details/${courseId}/${studentId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        if (result.success) {
          setData(result);
        }
      } catch (err) {
        console.error("Critical Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [courseId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(34,197,94,0.4)]"></div>
        <p className="text-green-500 text-sm font-black uppercase italic tracking-tighter">Fetching Subject Intel...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-[#0a0f1c] min-h-screen text-white selection:bg-green-500/30">
      
      {/* Navigation Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-500 hover:text-green-500 mb-4 transition-all group font-black text-[10px] uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase">
            Subject <span className="text-green-500">Performance</span>
          </h1>
        </div>

        <div className="bg-[#161d2f] px-6 py-4 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-4">
            <div className="p-2 bg-green-500/10 rounded-xl">
                <Layout size={20} className="text-green-500" />
            </div>
            <div>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Course ID</p>
                <p className="text-sm font-black text-white italic underline decoration-green-500">LP-SUB-{courseId}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Attendance Widget */}
        <div className="lg:col-span-1">
            <div className="bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute right-6 top-6 opacity-[0.07] group-hover:opacity-20 transition-all duration-700 text-green-500">
                    <Clock size={60} />
                </div>
                <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Attendance Score</p>
                <h2 className="text-7xl font-black tracking-tighter text-green-500 italic mb-6">
                    {data?.attendance?.percentage || 0}%
                </h2>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                        <span className="text-gray-500">Total Classes</span>
                        <span className="text-white">{data?.attendance?.total || 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                        <span className="text-gray-500">Present Days</span>
                        <span className="text-green-400">{data?.attendance?.present || 0}</span>
                    </div>
                </div>

                <div className="mt-8 w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className="bg-green-500 h-full transition-all duration-1000" 
                        style={{ width: `${data?.attendance?.percentage || 0}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Quizzes List */}
        <div className="lg:col-span-2">
            <div className="bg-[#161d2f] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl min-h-[400px]">
                <div className="flex items-center gap-3 mb-8">
                    <BookOpen className="text-green-500" size={20} />
                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Academic Assessment</h2>
                </div>

                <div className="grid gap-4">
                    {data?.quizzes && data.quizzes.length > 0 ? (
                        data.quizzes.map((quiz, idx) => (
                            <div key={idx} className="group flex justify-between items-center p-6 bg-black/20 rounded-[1.5rem] border border-white/5 hover:border-green-500/40 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${quiz.status === 'Done' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {quiz.status === 'Done' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black uppercase tracking-tighter text-white group-hover:text-green-400 transition-colors">{quiz.title}</p>
                                        <p className="text-[10px] font-bold text-gray-500 tracking-[0.1em] mt-1 uppercase">
                                            Score: <span className="text-white">{quiz.score || 0}</span> / {quiz.total_marks}
                                        </p>
                                    </div>
                                </div>
                                
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                    quiz.status === 'Done' 
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                }`}>
                                    {quiz.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                            <AlertCircle size={40} className="mb-4 opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">No quiz records found for this unit.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SubjectDetailPage;