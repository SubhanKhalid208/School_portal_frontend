'use client'
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { getApiUrl, fetchWithRetry } from '@/app/utils/api';

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [markedStudents, setMarkedStudents] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // ✅ Token aur TeacherId nikalne ka sahi tarika
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const teacherId = Cookies.get('userId');

  useEffect(() => {
    async function initData() {
      if (!token) {
        toast.error("Aap login nahi hain!");
        setLoading(false);
        return;
      }

      try {
        const stuUrl = getApiUrl('/teacher/students');
        const courseUrl = getApiUrl('/teacher/my-courses'); // Updated to use secure teacher courses
        
        const headers = { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [stuRes, courseRes] = await Promise.all([
          fetchWithRetry(stuUrl, { method: 'GET', headers }, 1),
          fetchWithRetry(courseUrl, { method: 'GET', headers }, 1)
        ]);
        
        const studentsData = await stuRes.json();
        const coursesData = await courseRes.json();
        
        // Backend response format ke mutabiq data extract karein
        setStudents(Array.isArray(studentsData.data) ? studentsData.data : (Array.isArray(studentsData) ? studentsData : []));
        setCourses(Array.isArray(coursesData.data) ? coursesData.data : (Array.isArray(coursesData) ? coursesData : []));
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        toast.error("Lahore Portal ka data load nahi ho saka");
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [token]);

  // Attendance Status Check (With Token)
  useEffect(() => {
    if (selectedCourse && token) {
      const today = new Date().toISOString().split('T')[0];
      const statusUrl = getApiUrl(`/attendance/check-status?date=${today}&courseId=${selectedCourse}`);
      
      fetchWithRetry(statusUrl, { 
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` } 
      }, 1)
        .then(res => res.json())
        .then(data => {
          setMarkedStudents(Array.isArray(data) ? data : []);
        })
        .catch(() => console.error("Attendance status check fail"));
    } else {
      setMarkedStudents([]);
    }
  }, [selectedCourse, token]);

  const markAttendance = async (studentId, status) => {
    if (!selectedCourse) {
      toast.error("Pehle Subject select karein!");
      return;
    }

    try {
      const url = getApiUrl('/attendance/mark');
      const res = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Token added
        },
        body: JSON.stringify({
          studentId,
          courseId: selectedCourse,
          status,
          teacherId,
          date: new Date().toISOString().split('T')[0]
        })
      }, 1);

      if (res.ok) {
        toast.success(`✅ ${status === 'present' ? 'Present' : 'Absent'} mark ho gayi!`);
        setMarkedStudents(prev => [...prev, studentId]);
      } else {
        const error = await res.json();
        toast.error(error.message || "Attendance save nahi ho saki");
      }
    } catch (err) {
      toast.error("Attendance save nahi ho saki");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a]">
      <div className="p-10 text-green-500 text-2xl font-bold animate-pulse text-center">
        Loading Lahore Portal Data...
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Attendance Panel</h1>
          <p className="text-gray-400 italic font-medium">As-Salam-u-Alaikum Subhan! Aaj ki attendance lagayein.</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-green-500 font-bold uppercase ml-1">Select Subject</label>
          <select 
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-[#161d2f] text-white border border-gray-800 p-3 rounded-xl focus:border-green-500 outline-none min-w-[200px] shadow-lg cursor-pointer transition-all"
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

      <div className="bg-[#161d2f] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1f2937] text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-5">Student Name</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {students.length > 0 ? students.map((s) => {
                const isAlreadyMarked = markedStudents.includes(s.id);
                
                return (
                  <tr key={s.id} className="hover:bg-gray-800/30 transition-all">
                    <td className="p-5">
                      <div className="font-bold text-white">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.email}</div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          disabled={isAlreadyMarked || !selectedCourse}
                          onClick={() => markAttendance(s.id, 'present')}
                          className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                            isAlreadyMarked 
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                              : 'bg-green-600/10 text-green-500 border border-green-500/30 hover:bg-green-600 hover:text-white shadow-lg shadow-green-900/10'
                          }`}
                        >
                          {isAlreadyMarked ? '✓ MARKED' : 'PRESENT'}
                        </button>
                        <button 
                          disabled={isAlreadyMarked || !selectedCourse}
                          onClick={() => markAttendance(s.id, 'absent')}
                          className={`px-6 py-2 rounded-lg font-bold text-xs transition-all ${
                            isAlreadyMarked 
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' 
                              : 'bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white shadow-lg shadow-red-900/10'
                          }`}
                        >
                          {isAlreadyMarked ? '✓ MARKED' : 'ABSENT'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="2" className="p-16 text-center text-gray-500 italic">No students found in Lahore Portal database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}