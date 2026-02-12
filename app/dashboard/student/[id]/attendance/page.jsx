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
    if (attendanceData?.success) {
      // ✅ FIX: Spread operator [...] use kiya hai array ki copy banane ke liye
      // RTK Query ka data read-only hota hai, isliye direct sort nahi ho sakta
      const sortedHistory = [...(attendanceData.history || [])].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setHistory(sortedHistory);
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
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-green-500 text-xl font-bold italic animate-pulse">
          Syncing Lahore DB...
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black italic text-green-500 tracking-tighter uppercase flex items-center gap-3">
            <Calendar size={32} /> Attendance Report
          </h1>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Portal ID: {studentId}</p>
        </div>
        <Link 
          href={`/dashboard/student/${studentId}`}
          className="flex items-center gap-2 bg-[#161d2f] hover:bg-green-600 border border-gray-800 hover:border-green-500 px-6 py-3 rounded-2xl transition-all font-bold text-sm shadow-xl"
        >
          <span className="flex items-center gap-2"><ChevronLeft size={18} /> BACK TO DASHBOARD</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase text-xs">Total Records</span>
            <span className="text-3xl font-black">{history.length}</span>
         </div>
         <div className="bg-[#161d2f] p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
            <span className="text-gray-400 font-bold uppercase text-xs">Last Updated</span>
            <span className="text-sm font-bold text-green-500 italic">
                {history[0] ? new Date(history[0].date).toLocaleDateString('en-PK') : 'No Data'}
            </span>
         </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-[#161d2f] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl backdrop-blur-sm bg-opacity-80">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 text-gray-500 uppercase text-[10px] tracking-[0.2em] font-black">
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Subject / Course</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {history.length > 0 ? (
                history.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-800/40 transition-colors group">
                    <td className="px-8 py-5 font-bold text-gray-200">
                      {new Date(record.date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-green-500 rounded-full opacity-50 group-hover:opacity-100 transition-all"></div>
                        <span className="font-medium text-gray-300 tracking-wide">{record.subject_name || 'General Attendance'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center">
                        {record.status?.toLowerCase() === 'present' ? (
                            <span className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                            <CheckCircle size={14} /> PRESENT
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                            <XCircle size={14} /> ABSENT
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-gray-500 font-mono text-xs">
                      <div className="flex items-center justify-end gap-2 italic">
                        <Clock size={12} className="text-gray-600" /> 
                        {record.created_at ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <Info size={48} className="text-blue-500" />
                      <div>
                        <p className="text-xl font-bold italic uppercase tracking-tighter">No Records Found</p>
                        <p className="text-sm">Student has not marked any attendance in Lahore Portal yet.</p>
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