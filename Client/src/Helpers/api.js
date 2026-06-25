import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ==================== USER ENDPOINTS ====================
export const userApi = {
  register: (data) => api.post('/user/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  login: (data) => api.post('/user/login', data),
  logout: () => api.post('/user/logout'),
  getProfile: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/update', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.post('/user/change-password', data),
  getUnverifiedTeachers: () => api.get('/user/teachers/unverified'),
  verifyTeacher: (teacherId) => api.put(`/user/teachers/${teacherId}/verify`),
  rejectTeacher: (teacherId, data) => api.delete(`/user/teachers/${teacherId}/reject`, { data }),
  getAllTeachers: () => api.get('/user/teachers'),
};

// ==================== COURSE ENDPOINTS ====================
export const courseApi = {
  getAllCourses: () => api.get('/course'),
  getMyEnrolledCourses: () => api.get('/course/my-courses/list'),
  getCourseById: (id) => api.get(`/course/${id}`),
  getTeacherStudents: () => api.get('/course/teacher/students'),
  createCourse: (data) => api.post('/course', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCourse: (id, data) => api.put(`/course/${id}`, data),
  deleteCourse: (id) => api.delete(`/course/${id}`),
  enrollCourse: (courseId) => api.post(`/course/${courseId}/enroll`),
  unenrollCourse: (courseId) => api.post(`/course/${courseId}/unenroll`),
  checkEnrollment: (courseId) => api.get(`/course/${courseId}/enrollment/check`),
  updateCourseProgress: (courseId, data) => api.put(`/course/${courseId}/progress`, data),
  addLecture: (id, data) => api.post(`/course/${id}/lectures`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  removeLecture: (courseId, lectureId) => api.delete(`/course/${courseId}/lectures/${lectureId}`),
};

// ==================== QUIZ ENDPOINTS ====================
export const quizApi = {
  createQuiz: (data) => api.post('/quiz/create', data),
  getQuiz: (id) => api.get(`/quiz/${id}`),
  getQuizForAttempt: (id) => api.get(`/quiz/${id}/attempt`),
  updateQuiz: (id, data) => api.put(`/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/quiz/${id}`),
  getQuizzesByCourse: (courseId) => api.get(`/quiz/course/${courseId}`),
  submitQuiz: (id, data) => api.post(`/quiz/${id}/submit`, data),
  getQuizResults: (id) => api.get(`/quiz/${id}/results`),
  getStudentSubmission: (submissionId) => api.get(`/quiz/submission/${submissionId}`),
  getStudentQuizzes: () => api.get('/quiz/my-quizzes'),
};

// ==================== QUESTION ENDPOINTS ====================
export const questionApi = {
  addQuestion: (quizId, data) => api.post(`/quiz/${quizId}/question`, data),
  updateQuestion: (questionId, data) => api.put(`/quiz/question/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/quiz/question/${questionId}`),
  getQuestion: (questionId) => api.get(`/quiz/question/${questionId}`),
  getQuizQuestions: (quizId) => api.get(`/quiz/${quizId}/questions`),
};

// ==================== FORUM ENDPOINTS ====================
export const forumApi = {
  // Categories
  getAllCategories: () => api.get('/forum/categories'),
  getCategory: (id) => api.get(`/forum/categories/${id}`),
  createCategory: (data) => api.post('/forum/categories', data),
  updateCategory: (id, data) => api.put(`/forum/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/forum/categories/${id}`),

  // Threads
  getAllThreads: (params) => api.get('/forum/threads', { params }),
  getThreadsByCategory: (categoryId, params) => api.get(`/forum/category/${categoryId}/threads`, { params }),
  getThread: (id) => api.get(`/forum/threads/${id}`),
  createThread: (data) => api.post('/forum/threads', data),
  updateThread: (id, data) => api.put(`/forum/threads/${id}`, data),
  deleteThread: (id) => api.delete(`/forum/threads/${id}`),
  pinThread: (id) => api.post(`/forum/threads/${id}/pin`),
  unpinThread: (id) => api.post(`/forum/threads/${id}/unpin`),
  closeThread: (id) => api.post(`/forum/threads/${id}/close`),
  searchThreads: (params) => api.get('/forum/threads/search', { params }),
  voteThread: (id, data) => api.post(`/forum/threads/${id}/vote`, data),

  // Replies
  getReplies: (threadId) => api.get(`/forum/threads/${threadId}/replies`),
  getRepliesByThread: (threadId) => api.get(`/forum/threads/${threadId}/replies`), // Alias
  getNestedReplies: (replyId) => api.get(`/forum/replies/${replyId}/nested`),
  createReply: (threadId, data) => api.post(`/forum/threads/${threadId}/replies`, data),
  updateReply: (id, data) => api.put(`/forum/replies/${id}`, data),
  deleteReply: (id) => api.delete(`/forum/replies/${id}`),
  markAcceptedAnswer: (id) => api.post(`/forum/replies/${id}/accept`),
  voteReply: (id, data) => api.post(`/forum/replies/${id}/vote`, data),
  
  // Aliases for consistency
  getCategoryById: (id) => api.get(`/forum/categories/${id}`),
  getThreadById: (id) => api.get(`/forum/threads/${id}`),
};

export default api;
