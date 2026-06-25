// Auth Routes
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  TEACHER_REGISTER: '/register-teacher',
  LOGOUT: '/logout',
};

// Teacher Routes
export const TEACHER_ROUTES = {
  DASHBOARD: '/teacher/dashboard',
  MY_COURSES: '/teacher/courses',
  CREATE_COURSE: '/teacher/create-course',
  EDIT_COURSE: '/teacher/courses/:id/edit',
  COURSE_DETAIL: '/teacher/courses/:id',
  CREATE_QUIZ: '/teacher/create-quiz',
  EDIT_QUIZ: '/teacher/quiz/:id/edit',
  QUIZ_RESULTS: '/teacher/quiz/:id/results',
  MANAGE_QUIZZES: '/teacher/manage-quizzes',
};

// Student Routes
export const STUDENT_ROUTES = {
  DASHBOARD: '/student/dashboard',
  MY_COURSES: '/student/courses',
  COURSE_DETAIL: '/student/courses/:id',
  MY_QUIZZES: '/student/quizzes',
  TAKE_QUIZ: '/student/quiz/:id',
  PROGRESS: '/student/progress',
  QUIZ_FEEDBACK: '/student/quiz/:id/feedback',
};

// Course Routes
export const COURSE_ROUTES = {
  ALL_COURSES: '/courses',
  COURSE_DETAIL: '/course/:id',
  ENROLL: '/course/:id/enroll',
};

// Forum Routes
export const FORUM_ROUTES = {
  HOME: '/forum',
  CATEGORY: '/forum/category/:id',
  THREAD: '/forum/thread/:id',
  CREATE_THREAD: '/forum/create-thread',
  SEARCH: '/forum/search',
};

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  TEACHERS: '/admin/teachers',
  COURSES: '/admin/courses',
  QUIZZES: '/admin/quizzes',
};
