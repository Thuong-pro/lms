import './App.css'
import { Route, Routes } from 'react-router-dom'

// Import Layouts
import HomeLayout from './Layouts/HomeLayout.jsx'
import DashboardLayout from './Layouts/DashboardLayout.jsx'

// Import Auth & Pages
import RequireAuth from './Compontents/Auth/RequireAuth.jsx'
import AboutUs from './Pages/AboutUs.jsx'
import Contact from './Pages/Contact.jsx'
import CourseDescripition from './Pages/Course/CourseDescription.jsx'
import CourseList from './Pages/Course/CourseList.jsx'
import CreateCourse from './Pages/Course/CreateCourse.jsx'
import EditCourse from './Pages/Course/EditCourse.jsx'
import Denied from './Pages/Denied.jsx'
import AddCourseLectures from './Pages/Deshboard/AddLectures.jsx'
import AdminDeshboard from './Pages/Deshboard/AdminDeshboard.jsx'
import Displaylectures from './Pages/Deshboard/DisplayLectures.jsx'
import HomePage from './Pages/HomePage.jsx'
import Login from './Pages/Login.jsx'
import NotFound from './Pages/NotFound.jsx'
import ChangePassword from './Pages/Password/ChangePassword.jsx'
import ForgetPassword from './Pages/Password/ForgetPassword.jsx'
import ResetPassword from './Pages/Password/ResetPassword.jsx'
import CheckoutPage from './Pages/Payment/Checkout.jsx'
import CheckoutFailure from './Pages/Payment/CheckoutFailure.jsx'
import CheckoutSuccess from './Pages/Payment/CheckoutSuccess.jsx'
import Signup from './Pages/Signup.jsx'
import EditProfile from './Pages/User/EditProfile.jsx'
import Profile from './Pages/User/Profile.jsx'

// Teacher Routes
import TeacherDashboard from './Pages/TeacherDashboard.jsx'
import CreateQuiz from './Pages/CreateQuiz.jsx'
import StudentProgress from './Pages/StudentProgress.jsx'
import ManageCourseQuizzes from './Pages/ManageCourseQuizzes.jsx'
import ManageQuizQuestions from './Pages/ManageQuizQuestions.jsx'

// Forum Routes
import ForumHome from './Pages/ForumHome.jsx'
import CategoryView from './Pages/CategoryView.jsx'
import ThreadDetail from './Pages/ThreadDetail.jsx'
import CreateThread from './Pages/CreateThread.jsx'

// Student Routes
import StudentDashboard from './Pages/StudentDashboard.jsx'
import StudentCourses from './Pages/StudentCourses.jsx'
import StudentQuizzes from './Pages/StudentQuizzes.jsx'
import StudentProgressPage from './Pages/StudentProgressPage.jsx'

// Quiz Routes
import TakeQuiz from './Pages/TakeQuiz.jsx'

function App() {
  return (
    <Routes>
      {/* ============================================================== */}
      {/* NHÓM 1: CÁC TRANG ĐỘC LẬP (KHÔNG DÙNG LAYOUT NÀO CẢ)         */}
      {/* ============================================================== */}
      <Route path='/signup' element={<Signup />} />
      <Route path='/login' element={<Login />} />
      <Route path='/forget-password' element={<ForgetPassword />} />
      <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
      <Route path='/denied' element={<Denied />} />

      {/* ============================================================== */}
      {/* NHÓM 2: CÁC TRANG CÔNG KHAI & USER (DÙNG HOMELAYOUT)         */}
      {/* ============================================================== */}
      <Route element={<HomeLayout />}>
        {/* --- ROUTE CÔNG KHAI --- */}
        <Route path='/' element={<HomePage />} />
        <Route path='/about' element={<AboutUs />} />
        <Route path='/courses' element={<CourseList />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/course/description' element={<CourseDescripition />} />

        {/* --- ROUTE CHO USER ĐÃ ĐĂNG NHẬP --- */}
        <Route element={<RequireAuth allowedRoles={["ADMIN", "TEACHER", "USER"]} />}>
          <Route path='/user/profile' element={<Profile />} />
          <Route path='/user/editprofile' element={<EditProfile />} />
          <Route path='/change-password' element={<ChangePassword />} />
          
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path='/checkout/success' element={<CheckoutSuccess />} />
          <Route path='/checkout/fail' element={<CheckoutFailure />} />      
          
          <Route path='/course/displaylecture' element={<Displaylectures />} />
          <Route path='/quiz/:quizId' element={<TakeQuiz />} />

          {/* Forum Routes */}
          <Route path='/forum' element={<ForumHome />} />
          <Route path='/forum/category/:id' element={<CategoryView />} />
          <Route path='/forum/thread/:id' element={<ThreadDetail />} />
          <Route path='/forum/create-thread' element={<CreateThread />} />
        </Route>
      </Route>

      {/* ============================================================== */}
      {/* NHÓM 3: KHÔNG GIAN QUẢN TRỊ & HỌC TẬP (DÙNG DASHBOARDLAYOUT)   */}
      {/* ============================================================== */}
      <Route element={<DashboardLayout />}>
        
        {/* --- KHU VỰC ADMIN --- */}
        <Route element={<RequireAuth allowedRoles={["ADMIN"]} />}>
          <Route path='/admin/deshboard' element={<AdminDeshboard />} />
        </Route>

        {/* --- KHU VỰC TEACHER & ADMIN CÙNG QUẢN LÝ --- */}
        <Route element={<RequireAuth allowedRoles={["ADMIN", "TEACHER"]} />}>
          <Route path='/teacher/dashboard' element={<TeacherDashboard />} />
          
          <Route path='/course/create' element={<CreateCourse />} />
          <Route path='/course/edit' element={<EditCourse />} />
          <Route path='/course/addlecture' element={<AddCourseLectures />} />
          
          <Route path='/teacher/course/:courseId/quizzes' element={<ManageCourseQuizzes />} />
          <Route path='/teacher/quiz/:quizId/questions' element={<ManageQuizQuestions />} />
          
          <Route path='/teacher/quiz/create' element={<CreateQuiz />} />
          <Route path='/teacher/students' element={<StudentProgress />} />
        </Route>

        {/* --- KHU VỰC DÀNH CHO STUDENT --- */}
        <Route element={<RequireAuth allowedRoles={["USER"]} />}>
          <Route path='/student/dashboard' element={<StudentDashboard />} />
          <Route path='/student/courses' element={<StudentCourses />} />
          <Route path='/student/quizzes' element={<StudentQuizzes />} />
          <Route path='/student/progress' element={<StudentProgressPage />} />
        </Route>

      </Route>

      {/* Trang Lỗi 404 */}
      <Route path='*' element={<NotFound />} />
      
    </Routes>
  )
}

export default App