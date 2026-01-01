import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import AdminDashboard from "./pages/admin/dashboard";
import AdminTimetable from "./pages/admin/timetable";
import StudentTimetable from "./pages/student/timetable";
import ProtectedRoute from "./components/ProtectedRoute";
import TimetablePage from "./components/admin/TimetablePage.jsx";
import StudentDashboard from "./pages/student/StudentDashboard";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/timetable" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <TimetablePage />
        </ProtectedRoute>
      } />

      {/* Student Routes */}
      <Route path="/student/timetable" element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
          <StudentTimetable />
        </ProtectedRoute>
      } />

      {/* ADD THE NEW LINE HERE */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={["STUDENT"]}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;