import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://school-portal-backend-production.up.railway.app/api', 
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    // ✅ 1. CORS Fix: Yeh line browser ko batati hai ke login session allow kare
    credentials: 'include', 
  }),
  tagTypes: ['Quiz', 'Attendance', 'Course', 'MCQ', 'Result', 'User', 'Admin', 'Student', 'Auth'], 
  endpoints: (builder) => ({
    
    // --- ATTENDANCE ---
    markAttendance: builder.mutation({
      query: (data) => ({ url: '/attendance/mark', method: 'POST', body: data }),
      invalidatesTags: ['Attendance'],
    }),
    checkAttendanceStatus: builder.query({
      query: ({ date, courseId }) => `/attendance/check-status?date=${encodeURIComponent(date)}&courseId=${encodeURIComponent(courseId)}`,
      providesTags: ['Attendance'],
    }),
    getStudentAttendance: builder.query({ 
      query: (studentId) => `/student/attendance/student/${studentId}`, 
      providesTags: ['Attendance'] 
    }),

    // --- AUTH ---
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
      invalidatesTags: ['User', 'Auth'],
    }),
    signup: builder.mutation({
      query: (payload) => ({ url: '/auth/signup', method: 'POST', body: payload }),
      invalidatesTags: ['User'],
    }),
    resetPassword: builder.mutation({
      query: (payload) => ({ url: '/auth/reset-password', method: 'POST', body: payload }),
      invalidatesTags: ['Auth'],
    }),
    getAuthUsers: builder.query({ 
      query: (params = '') => `/auth/users${params ? `?${params}` : ''}`, 
      providesTags: ['User'] 
    }),

    // --- ADMIN ---
    getAdminStats: builder.query({ query: () => '/admin/stats', providesTags: ['Admin'] }),
    getAdminUsers: builder.query({
      query: (search = '') => ({ url: `/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}` }),
      providesTags: ['User'],
    }),
    createOrUpdateAdminUser: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: id ? `/admin/users/${id}` : '/admin/users',
        method: id ? 'PUT' : 'POST',
        body: payload,
      }),
      invalidatesTags: ['User', 'Admin'],
    }),
    deleteAdminUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User', 'Admin'],
    }),
    uploadAdminImage: builder.mutation({
      query: (formData) => ({ url: '/admin/upload-image', method: 'POST', body: formData }),
      invalidatesTags: ['User'],
    }),
    bulkUploadStudents: builder.mutation({
      query: (formData) => ({ url: '/student/bulk-upload', method: 'POST', body: formData }),
      invalidatesTags: ['User', 'Admin'],
    }),

    // --- COURSES (ERP & Teacher) ---
    getCourses: builder.query({ query: () => '/courses/all', providesTags: ['Course'] }),
    deleteCourse: builder.mutation({
      query: (id) => ({ url: `/courses/delete/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Course'],
    }),
    getTeacherCourses: builder.query({ query: () => '/teacher/my-courses', providesTags: ['Course'] }),
    getTeacherStats: builder.query({ query: () => '/teacher/stats', providesTags: ['Admin'] }),
    createCourseTeacher: builder.mutation({ 
      query: (payload) => ({ url: '/teacher/courses/add', method: 'POST', body: payload }), 
      invalidatesTags: ['Course'] 
    }),
    updateCourseTeacher: builder.mutation({ 
      query: ({ id, ...payload }) => ({ url: `/teacher/courses/${id}`, method: 'PUT', body: payload }), 
      invalidatesTags: ['Course'] 
    }),
    deleteCourseTeacher: builder.mutation({ 
      query: (id) => ({ url: `/teacher/courses/${id}`, method: 'DELETE' }), 
      invalidatesTags: ['Course'] 
    }),
    getTeacherStudents: builder.query({ query: () => '/teacher/students', providesTags: ['Student'] }),

    // --- QUIZ MANAGEMENT (Teacher) ---
    getQuizzes: builder.query({ query: () => '/quiz/teacher/all-quizzes', providesTags: ['Quiz'] }),
    getTeacherQuizzes: builder.query({ query: () => '/quiz/teacher/all-quizzes', providesTags: ['Quiz'] }),
    createQuiz: builder.mutation({ 
      query: (payload) => ({ url: '/quiz/teacher/create', method: 'POST', body: payload }), 
      invalidatesTags: ['Quiz'] 
    }),
    assignQuiz: builder.mutation({ 
      query: (payload) => ({ url: '/quiz/teacher/assign', method: 'POST', body: payload }), 
      invalidatesTags: ['Quiz'] 
    }),
    deleteQuiz: builder.mutation({ 
      query: (id) => ({ url: `/quiz/teacher/delete-quiz/${id}`, method: 'DELETE' }), 
      invalidatesTags: ['Quiz'] 
    }),
    getQuizResults: builder.query({ 
      query: (quizId) => `/quiz/teacher/results/${quizId}`, 
      providesTags: ['Result'] 
    }),

    // --- MCQS & QUESTIONS ---
    getQuizMcqs: builder.query({ 
      query: (quizId) => `/quiz/teacher/mcqs/${quizId}`, 
      providesTags: ['MCQ'] 
    }),
    deleteMcq: builder.mutation({
      query: (mcqId) => ({ url: `/quiz/teacher/delete-mcq/${mcqId}`, method: 'DELETE' }),
      invalidatesTags: ['MCQ', 'Quiz'],
    }),
    getQuestionsList: builder.query({ 
      query: (quizId) => `/quiz/questions-list/${quizId}`, 
      providesTags: ['MCQ'] 
    }),
    deleteQuestion: builder.mutation({ 
      query: (qId) => ({ url: `/quiz/question/${qId}`, method: 'DELETE' }), 
      invalidatesTags: ['MCQ'] 
    }),

    // --- STUDENT QUIZ ---
    getStudentQuizzes: builder.query({ query: () => '/quiz/student/my-quizzes', providesTags: ['Quiz'] }),
    getQuizQuestions: builder.query({ 
      query: (assignmentId) => `/quiz/questions/${assignmentId}`, 
      providesTags: ['MCQ'] 
    }),
    submitStudentQuiz: builder.mutation({ 
      query: (payload) => ({ url: '/quiz/student/submit', method: 'POST', body: payload }), 
      invalidatesTags: ['Result'] 
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetQuizzesQuery,
  useGetQuizMcqsQuery,
  useDeleteMcqMutation,
  useGetQuizResultsQuery,
  useGetCoursesQuery,
  useDeleteCourseMutation,
  useLoginMutation,
  useSignupMutation,
  useResetPasswordMutation,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useCreateOrUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUploadAdminImageMutation,
  useBulkUploadStudentsMutation,
  useGetTeacherCoursesQuery,
  useGetTeacherStatsQuery,
  useCreateCourseTeacherMutation,
  useUpdateCourseTeacherMutation,
  useDeleteCourseTeacherMutation,
  useGetTeacherStudentsQuery,
  useCheckAttendanceStatusQuery,
  useCreateQuizMutation,
  useAssignQuizMutation,
  useGetTeacherQuizzesQuery,
  useGetQuestionsListQuery,
  useDeleteQuestionMutation,
  useDeleteQuizMutation,
  useGetStudentQuizzesQuery,
  useGetQuizQuestionsQuery,
  useSubmitStudentQuizMutation,
  useGetStudentAttendanceQuery,
  useGetAuthUsersQuery,
} = apiSlice;