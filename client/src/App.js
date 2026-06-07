import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

/* Dashboards */
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import ParentDashboard from "./pages/dashboards/ParentDashboard";

/* Homework */
import AdminHomework from "./pages/homework/AdminHomework";
import TeacherHomework from "./pages/homework/TeacherHomework";
import StudentHomework from "./pages/homework/StudentHomework";
import ParentHomework from "./pages/homework/ParentHomework";

/* Results */
import AdminResults from "./pages/results/AdminResults";
import TeacherResults from "./pages/results/TeacherResults";
import StudentResults from "./pages/results/StudentResults";
import ParentResults from "./pages/results/ParentResults";

/* Fee */
import AdminFee from "./pages/fee/AdminFee";
import StudentFee from "./pages/fee/StudentFee";
import ParentFee from "./pages/fee/ParentFee";

/* Attendance */
import TeacherAttendance from "./pages/attendance/TeacherAttendance";
import StudentAttendance from "./pages/attendance/StudentAttendance";

/* Timetable */
import TeacherTimetable from "./pages/timetable/TeacherTimetable";
import StudentTimetable from "./pages/timetable/StudentTimetable";
import AdminTimetable from "./pages/timetable/AdminTimetable";

import TeacherStudents from "./pages/students/TeacherStudents";

import TeacherNotice from "./pages/notice/TeacherNotice";
import StudentNotice from "./pages/notice/StudentNotice";

import StudentTeachers from "./pages/teachers/StudentTeachers";

import AdminStudents from "./pages/dashboards/AdminStudents";

import AdminAchievements from "./pages/dashboards/AdminAchievements";

import ParentAttendance from "./pages/parent/ParentAttendance";
import ParentTeachers   from "./pages/parent/ParentTeachers";
import ParentNotices    from "./pages/parent/ParentNotices";

const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" />;
  }

  const routes = {
    admin: "/admin/dashboard",
    teacher: "/teacher/dashboard",
    student: "/student/dashboard",
    parent: "/parent/dashboard",
  };

  return <Navigate to={routes[user.role] || "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* ================= ADMIN ================= */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/homework"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminHomework />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/fee"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminFee />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><AdminStudents /></ProtectedRoute>} />

<Route path="/admin/timetable"    element={<ProtectedRoute allowedRoles={["admin"]}><AdminTimetable /></ProtectedRoute>} />
<Route path="/admin/achievements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAchievements /></ProtectedRoute>} />

          {/* ================= TEACHER ================= */}

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/homework"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherHomework />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/results"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/timetable"
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherTimetable />
              </ProtectedRoute>
            }
          />

          <Route
  path="/teacher/students"
  element={
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherStudents />
    </ProtectedRoute>
  }
/>

<Route path="/teacher/notice" element={<ProtectedRoute allowedRoles={["teacher"]}><TeacherNotice /></ProtectedRoute>} />

          {/* ================= STUDENT ================= */}

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/homework"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentHomework />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/results"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/fee"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentFee />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAttendance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentTimetable />
              </ProtectedRoute>
            }
          />

          <Route path="/student/notice" element={<ProtectedRoute allowedRoles={["student"]}><StudentNotice /></ProtectedRoute>} />

<Route
  path="/student/teachers"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentTeachers />
    </ProtectedRoute>
  }
/>


          {/* ================= PARENT ================= */}

          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent/homework"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <ParentHomework />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent/results"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <ParentResults />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent/fee"
            element={
              <ProtectedRoute allowedRoles={["parent"]}>
                <ParentFee />
              </ProtectedRoute>
            }
          />

          <Route path="/parent/attendance" element={<ProtectedRoute allowedRoles={["parent"]}><ParentAttendance /></ProtectedRoute>} />
<Route path="/parent/teachers"   element={<ProtectedRoute allowedRoles={["parent"]}><ParentTeachers /></ProtectedRoute>} />
<Route path="/parent/notices"    element={<ProtectedRoute allowedRoles={["parent"]}><ParentNotices /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;