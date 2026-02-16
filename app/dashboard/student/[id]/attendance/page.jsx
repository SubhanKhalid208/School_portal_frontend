'use client'
import { useEffect, useState, use } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, CheckCircle, XCircle, Clock, ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useGetStudentAttendanceQuery } from '@/src/lib/redux/apiSlice';

export default function AttendanceReportPage({ params }) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  const { data: attendanceData, isLoading: loading, error } = useGetStudentAttendanceQuery(studentId, { skip: !studentId });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // 🔍 Debugging ke liye: Browser console mein check karein
    console.log("Full Attendance Data:", attendanceData);

    if (attendanceData?.success) {
      // ✅ FIXED: Double nesting handle ki hai as per your screenshot
      // Agar data.data.history hai toh wo lein, warna data.history, warna khali array
      const rawHistory = attendanceData.data?.history || attendanceData.history || [];
      
      if (Array.isArray(rawHistory)) {
        const sortedHistory = [...rawHistory].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
        setHistory(sortedHistory);
      }
    } else if (attendanceData?.success === false) {
      toast.error(attendanceData.message || "Data fetch karne mein masla hua.");
    }
  }, [attendanceData]);

  useEffect(() => {
    if (error) {
      toast.error("Lahore Portal: Server connection error!");
    }
  }, [error]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(34,197,94,0.3)]"></div>
        <div className="text-green-500 text-xl font-black italic tracking-tighter animate-pulse">
          SYNCING LAHORE DB...
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white min-h-screen selection:bg-green-500/30">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black italic text-white tracking-tighter uppercase flex items-center gap-3">
            <Calendar size={32} className="text-green-500" /> Attendance <span className="text-green-500">Report</span>
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Lahore Education Hub | ID: {studentId}</p>
          </div>
        </div>
        <Link 
          href={`/dashboard/student/${studentId}`}
          className="flex items-center gap-2 bg-[#161d2f] hover:bg-green-600/20 border border-white/5 hover:border-green-500/50 px-6 py-3 rounded-2xl transition-all duration-300 font-black text-[10px] tracking-[0.1em] shadow-2xl group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> BACK TO DASHBOARD
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-[#161d2f] p-8 rounded-[2rem] border border-white/5 flex justify-between items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <div className="relative z-10">
                <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest block mb-1">Total Records</span>
                <span className="text-4xl font-black italic tracking-tighter text-white">{history.length}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-green-500">
                <CheckCircle size={24} />
            </div>
         </div>
         
         <div className="bg-[#161d2f] p-8 rounded-[2rem] border border-white/5 flex justify-between items-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <div className="relative z-10">
                <span className="text-gray-500 font-black uppercase text-[10px] tracking-widest block mb-1">Last Updated</span>
                <span className="text-xl font-black text-green-500 italic uppercase tracking-tighter">
                    {history[0] ? new Date(history[0].date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : 'No Data'}
                </span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl text-blue-500">
                <Clock size={24} />
            </div>
         </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-[#161d2f] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] text-gray-500 uppercase text-[9px] tracking-[0.3em] font-black">
                <th className="px-10 py-8">Date</th>
                <th className="px-10 py-8">Subject / Course</th>
                <th className="px-10 py-8 text-center">Status</th>
                <th className="px-10 py-8 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length > 0 ? (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6 font-black text-white italic tracking-tighter">
                      {new Date(record.date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-5 bg-green-500 rounded-full group-hover:h-8 transition-all duration-300"></div>
                        <span className="font-black text-gray-400 uppercase text-[11px] tracking-widest group-hover:text-white transition-colors">
                            {record.subject_name || 'General Attendance'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="flex justify-center">
                        {record.status?.toLowerCase() === 'present' ? (
                            <span className="flex items-center gap-2 text-green-500 bg-green-500/5 border border-green-500/20 px-5 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase">
                                <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
                                PRESENT
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-red-500 bg-red-500/5 border border-red-500/20 px-5 py-2 rounded-full text-[9px] font-black tracking-[0.2em] uppercase">
                                <XCircle size={12} /> ABSENT
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right font-mono text-[10px] text-gray-600">
                      <div className="flex items-center justify-end gap-2 group-hover:text-green-500 transition-colors">
                        <Clock size={12} /> 
                        {record.created_at ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="p-6 bg-blue-500/5 rounded-full border border-blue-500/10">
                        <Info size={40} className="text-blue-500/40" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black italic uppercase tracking-tighter text-gray-400">Database Empty</p>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                            Ahmad, student has not marked any attendance in Lahore Portal records yet.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}