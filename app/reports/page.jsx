"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
// Muhammad Ahmed, Next.js ke liye ye import ka tareeka sab se behtar hai
import autoTable from 'jspdf-autotable';

const ReportsPage = () => {
    const [activeTab, setActiveTab] = useState('attendance'); 
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // --- Muhammad Ahmed, PDF Generate karne ka Function (Fixed) ---
    const downloadPDF = () => {
        if (!data || data.length === 0) {
            alert("Download karne ke liye data mojood nahi hai!");
            return;
        }

        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();
        
        // Report Header Design
        doc.setFontSize(20);
        doc.setTextColor(40);
        doc.text("Lahore Education Portal", 14, 15);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Report Type: ${activeTab.toUpperCase()}`, 14, 25);
        doc.text(`Date: ${timestamp}`, 14, 32);
        doc.text(`Admin: Muhammad Ahmed`, 14, 39);
        doc.text(`Location: Lahore, Punjab, Pakistan`, 14, 46);
        
        // Table Columns nikalna data se
        const tableColumn = Object.keys(data[0]);
        const tableRows = data.map(item => Object.values(item));

        // AutoTable Style - Muhammad Ahmed, yahan direct function use kiya hai taake error na aaye
        autoTable(doc, {
            startY: 55,
            head: [tableColumn.map(col => col.toUpperCase().replace('_', ' '))],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255] }, // Greenish theme
            styles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
        });

        doc.save(`${activeTab}_Report_Muhammad_Ahmed.pdf`);
    };

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            setError(null);
            try {
                let endpoint = '';
                switch(activeTab) {
                    case 'attendance': endpoint = '/api/reports/student-attendance-report'; break;
                    case 'workload': endpoint = '/api/reports/teacher-course-load'; break;
                    case 'performance': endpoint = '/api/reports/top-students'; break;
                    case 'popularity': endpoint = '/api/reports/course-popularity'; break;
                    default: endpoint = '/api/reports/student-attendance-report';
                }
                
                const response = await axios.get(`${API_BASE_URL}${endpoint}`);
                
                if (response.data) {
                    setData(response.data);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching report:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchReport();
    }, [activeTab, API_BASE_URL]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white font-sans">
            <div className="text-xl animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                Muhammad Ahmed, Loading {activeTab.replace('-', ' ')} Data...
            </div>
        </div>
    );

    if (error) return (
        <div className="p-10 bg-[#0f172a] min-h-screen text-red-400 font-sans text-center">
            <div className="max-w-md mx-auto bg-red-900/20 p-6 rounded-lg border border-red-500/50">
                <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
                <p>Status: {error}</p>
                <button onClick={() => window.location.reload()} className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full font-bold hover:bg-red-600 transition-colors">Retry</button>
            </div>
        </div>
    );

    return (
        <div className="p-8 bg-[#0f172a] min-h-screen text-white font-sans">
            <header className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <button 
                        onClick={() => window.history.back()} 
                        className="mb-4 text-sm text-gray-400 hover:text-white flex items-center transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                        {activeTab === 'attendance' && 'Attendance Analytics'}
                        {activeTab === 'workload' && 'Teacher Analytics'}
                        {activeTab === 'performance' && 'Student Leaderboard'}
                        {activeTab === 'popularity' && 'Course Insights'}
                    </h1>
                    <p className="mt-2 text-gray-400">Location: Lahore, Pakistan | Admin: Muhammad Ahmed</p>
                </div>

                <div className="flex flex-col gap-4 items-end">
                    <button 
                        onClick={downloadPDF}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <span>📥</span> Download PDF Report
                    </button>

                    <div className="flex flex-wrap bg-gray-800/50 p-1 rounded-lg border border-gray-700 gap-1">
                        {[
                            { id: 'attendance', label: 'Attendance', color: 'bg-green-500' },
                            { id: 'workload', label: 'Workload', color: 'bg-blue-600' },
                            { id: 'performance', label: 'Top Students', color: 'bg-yellow-500' },
                            { id: 'popularity', label: 'Course Stats', color: 'bg-purple-600' }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-md text-xs font-black transition-all ${activeTab === tab.id ? `${tab.color} text-white shadow-lg` : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                            >
                                {tab.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </header>
            
            <div className="overflow-hidden rounded-xl border border-gray-800 shadow-2xl bg-[#1e293b]/40 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1e293b]/80">
                        <tr>
                            {activeTab === 'attendance' && <>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700">ID</th>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700">Student Name</th>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700 text-center">Sessions</th>
                                <th className="p-4 font-semibold text-green-400 border-b border-gray-700 text-center">Present</th>
                                <th className="p-4 font-semibold text-blue-400 border-b border-gray-700 text-right">Attendance %</th>
                            </>}
                            {activeTab === 'workload' && <>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700">T-ID</th>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700">Teacher Name</th>
                                <th className="p-4 font-semibold text-purple-400 border-b border-gray-700 text-center">Courses</th>
                                <th className="p-4 font-semibold text-orange-400 border-b border-gray-700 text-center">Quizzes</th>
                                <th className="p-4 font-semibold text-gray-400 border-b border-gray-700 text-right">Email</th>
                            </>}
                            {activeTab === 'performance' && <>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700">Student Name</th>
                                <th className="p-4 font-semibold text-yellow-400 border-b border-gray-700 text-center">Quizzes</th>
                                <th className="p-4 font-semibold text-green-400 border-b border-gray-700 text-center">Avg Score</th>
                                <th className="p-4 font-semibold text-blue-400 border-b border-gray-700 text-right">Highest</th>
                            </>}
                            {activeTab === 'popularity' && <>
                                <th className="p-4 font-semibold text-gray-300 border-b border-gray-700">Course Title</th>
                                <th className="p-4 font-semibold text-purple-400 border-b border-gray-700 text-center">Instructor</th>
                                <th className="p-4 font-semibold text-green-400 border-b border-gray-700 text-right">Enrollments</th>
                            </>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800/50 hover:bg-gray-700/30 transition-all duration-200">
                                {activeTab === 'attendance' && <>
                                    <td className="p-4 text-gray-500 font-mono text-sm">#{item.student_id}</td>
                                    <td className="p-4 font-medium">{item.student_name}</td>
                                    <td className="p-4 text-center">{item.total_sessions}</td>
                                    <td className="p-4 text-center text-green-400 font-semibold">{item.present_count}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-bold mb-1">{item.attendance_percentage}%</span>
                                            <div className="w-20 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500" style={{ width: `${item.attendance_percentage}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                </>}
                                {activeTab === 'workload' && <>
                                    <td className="p-4 text-gray-500 font-mono text-sm">#{item.teacher_id}</td>
                                    <td className="p-4 font-medium uppercase">{item.teacher_name}</td>
                                    <td className="p-4 text-center text-purple-400 font-bold">{item.total_subjects}</td>
                                    <td className="p-4 text-center text-orange-400 font-bold">{item.total_quizzes}</td>
                                    <td className="p-4 text-right text-gray-500 text-xs italic">{item.teacher_email}</td>
                                </>}
                                {activeTab === 'performance' && <>
                                    <td className="p-4 font-medium">{item.student_name}</td>
                                    <td className="p-4 text-center">{item.quizzes_attempted}</td>
                                    <td className="p-4 text-center text-green-400 font-black">{item.average_score}</td>
                                    <td className="p-4 text-right text-blue-400 font-bold">{item.highest_score}</td>
                                </>}
                                {activeTab === 'popularity' && <>
                                    <td className="p-4 font-bold text-blue-300">{item.course_title}</td>
                                    <td className="p-4 text-center text-gray-400 italic">{item.instructor_name}</td>
                                    <td className="p-4 text-right">
                                        <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-black border border-green-500/20">
                                            {item.total_enrollments} Students
                                        </span>
                                    </td>
                                </>}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-20 text-center text-gray-500 italic font-medium">
                                    Muhammad Ahmed, data load ho raha hai ya records mojood nahi hain...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportsPage;