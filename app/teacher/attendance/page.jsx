'use client'
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
// ✅ Redux Hooks Import
import { 
  useGetTeacherStudentsQuery, 
  useGetTeacherCoursesQuery, 
  useCheckAttendanceStatusQuery, 
  useMarkAttendanceMutation 
} from '@/src/lib/redux/apiSlice';

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const teacherId = Cookies.get('userId');
  const today = new Date().toISOString().split('T')[0];

  // ✅ Redux Queries (Auto-fetching)
  const { data: studentsData, isLoading: loadingStudents } = useGetTeacherStudentsQuery();
  const { data: coursesData, isLoading: loadingCourses } = useGetTeacherCoursesQuery();
  
  // ✅ Attendance status check hook (Skip if no course selected)
  const { data: markedStudents = [], isFetching: checkingStatus } = useCheckAttendanceStatusQuery(
    { date: today, courseId: selectedCourse },
    { skip: !selectedCourse }
  );

  // ✅ Mutation Hook
  const [markAttendance, { isLoading: isMarking }] = useMarkAttendanceMutation();

  const students = studentsData?.data || studentsData || [];
  const courses = coursesData?.data || coursesData || [];

  const handleMarkAttendance = async (studentId, status) => {
    if (!selectedCourse) {
      toast.error("Pehle Subject select karein!");
      return;
    }

    try {
      await markAttendance({
        studentId,
        courseId: selectedCourse,
        status,
        teacherId,
        date: today
      }).unwrap();

      toast.success(`✅ ${status === 'present' ? 'Present' : 'Absent'} mark ho gayi!`);
    } catch (err) {
      toast.error(err?.data?.message || "Attendance save nahi ho saki");
    }
  };

  if (loadingStudents || loadingCourses) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="p-10 text-green-500 text-2xl font-bold animate-pulse text-center uppercase italic">
        Loading Lahore Portal Data...
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Attendance Panel</h1>
          <p className="text-gray-400 italic font-medium">Assalam o Alaikum subhan aj ke attendence laga sakta ha ab .</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-green-500 font-black uppercase ml-1 tracking-widest">Select Subject</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[#161d2f] text-white border border-white/10 p-4 rounded-xl focus:border-green-500 outline-none min-w-[240px] shadow-2xl cursor-pointer transition-all font-bold"
          >
            <option value="">-- Choose Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name || course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[#161d2f] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-gray-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">Student Name</th>
                <th className="p-6 text-center">Mark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.length > 0 ? students.map((s) => {
                const isAlreadyMarked = markedStudents.includes(s.id);
                
                return (
                  <tr key={s.id} className="hover:bg-white/5 transition-all group">
                    <td className="p-6">
                      <div className="font-black text-gray-200 group-hover:text-white transition-colors uppercase italic">{s.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono tracking-tighter">{s.email}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-4">
                        <button 
                          disabled={isAlreadyMarked || !selectedCourse || isMarking}
                          onClick={() => handleMarkAttendance(s.id, 'present')}
                          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all tracking-widest ${
                            isAlreadyMarked 
                              ? 'bg-gray-800/50 text-gray-600 border border-transparent' 
                              : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white shadow-lg shadow-green-500/10 active:scale-95'
                          }`}
                        >
                          {isAlreadyMarked ? '✓ Recorded' : 'Present'}
                        </button>
                        <button 
                          disabled={isAlreadyMarked || !selectedCourse || isMarking}
                          onClick={() => handleMarkAttendance(s.id, 'absent')}
                          className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase transition-all tracking-widest ${
                            isAlreadyMarked 
                              ? 'bg-gray-800/50 text-gray-600 border border-transparent' 
                              : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-lg shadow-red-500/10 active:scale-95'
                          }`}
                        >
                          {isAlreadyMarked ? '✓ Recorded' : 'Absent'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="2" className="p-20 text-center text-gray-600 italic font-black uppercase tracking-[0.2em] text-xs">
                    No students found in Lahore database.
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