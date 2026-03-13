import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { useAuthStore } from "./stores/authStore";
import { getRoleBasedRedirectPath, normalizeRole } from "./lib/authRole.ts";

import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { Dashboard } from "./pages/Dashboard";
import { Learning } from "./pages/Learning";
import { MyCourses } from "./pages/MyCourses";
import { CourseContent } from "./pages/CourseContent";
import { AdminCourseContent } from "./pages/AdminCourseContent";
import { Certifications } from "./pages/Certifications";
import { ExamProctoring } from "./pages/ExamProctoring";
import { PerformanceAnalytics } from "./pages/PerformanceAnalytics";
import { SettingsPage } from "./pages/Settings";
import { InstructorSettingsPage } from "./pages/InstructorSettings";
import { AdminSettingsPage } from "./pages/AdminSettings";
import OAuthCallback from "./pages/OAuthCallback";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { CourseAdminDashboard } from "./pages/CourseAdminDashboard";
import { AdminCourses } from "./pages/AdminCourses";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminDoubts } from "./pages/AdminDoubts";
import { InstructorCourses } from "./pages/InstructorCourses";
import { InstructorDoubts } from "./pages/InstructorDoubts";
import { StudentDoubts } from "./pages/StudentDoubts";

import "./globals.css";

function ProtectedRoute({
  element,
}: {
  element: React.ReactElement;
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="min-h-screen" />;
  return user ? element : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({
  element,
}: {
  element: React.ReactElement;
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  // Show nothing while loading to prevent flash
  if (loading) return <div className="min-h-screen" />;

  if (!user) return element;

  // Redirect authenticated users to their role-specific dashboard
  return <Navigate to={getRoleBasedRedirectPath(user.role)} replace />;
}

function LandingRoute(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="min-h-screen" />;
  if (user) {
    return <Navigate to={getRoleBasedRedirectPath(user.role)} replace />;
  }

  return <Landing />;
}

function StudentDashboardRoute(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;

  const role = normalizeRole(user.role);
  if (role !== 'student') {
    return <Navigate to={getRoleBasedRedirectPath(role)} replace />;
  }

  return <Dashboard />;
}

function StudentSettingsRoute(): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/login" replace />;

  const role = normalizeRole(user.role);
  if (role === 'admin') {
    return <Navigate to="/admin/settings" replace />;
  }
  if (role === 'instructor') {
    return <Navigate to="/instructor/settings" replace />;
  }

  return <SettingsPage />;
}

function AdminRoute({
  element,
}: {
  element: React.ReactElement;
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="min-h-screen" />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
}

function InstructorRoute({
  element,
}: {
  element: React.ReactElement;
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) return <div className="min-h-screen" />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'instructor' && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
}

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <div className="flex items-stretch">
          {user && <Sidebar />}

          <main className={`min-w-0 flex-1 overflow-x-hidden`}>
            <div className={user ? "w-full" : ""}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingRoute />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />

                {/* Auth (public-only) */}
                <Route
                  path="/login"
                  element={<PublicOnlyRoute element={<Login />} />}
                />
                <Route
                  path="/register"
                  element={<PublicOnlyRoute element={<Register />} />}
                />

                {/* OAuth callback (public — handles redirect from backend) */}
                <Route path="/oauth-callback" element={<OAuthCallback />} />

                {/* Protected */}
                <Route
                  path="/dashboard"
                  element={<StudentDashboardRoute />}
                />
                <Route
                  path="/learn/:courseId/:moduleId"
                  element={<ProtectedRoute element={<Learning />} />}
                />
                <Route
                  path="/my-courses"
                  element={<ProtectedRoute element={<MyCourses />} />}
                />
                <Route
                  path="/course-content/:courseId"
                  element={<ProtectedRoute element={<CourseContent />} />}
                />
                <Route
                  path="/certifications"
                  element={<ProtectedRoute element={<Certifications />} />}
                />
                <Route
                  path="/exam"
                  element={<ProtectedRoute element={<ExamProctoring />} />}
                />
                <Route
                  path="/performance"
                  element={<ProtectedRoute element={<PerformanceAnalytics />} />}
                />
                <Route
                  path="/settings"
                  element={<StudentSettingsRoute />}
                />
                <Route
                  path="/doubts"
                  element={<ProtectedRoute element={<StudentDoubts />} />}
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={<AdminRoute element={<SuperAdminDashboard />} />}
                />
                <Route
                  path="/admin/courses"
                  element={<AdminRoute element={<AdminCourses />} />}
                />
                <Route
                  path="/admin/courses/:courseId/content"
                  element={<AdminRoute element={<AdminCourseContent />} />}
                />
                <Route
                  path="/admin/users"
                  element={<AdminRoute element={<AdminUsers />} />}
                />
                <Route
                  path="/admin/doubts"
                  element={<AdminRoute element={<AdminDoubts />} />}
                />
                <Route
                  path="/admin/settings"
                  element={<AdminRoute element={<AdminSettingsPage />} />}
                />

                {/* Instructor Routes */}
                <Route
                  path="/instructor/dashboard"
                  element={<InstructorRoute element={<CourseAdminDashboard />} />}
                />
                <Route
                  path="/instructor/courses"
                  element={<InstructorRoute element={<InstructorCourses />} />}
                />
                <Route
                  path="/instructor/courses/:courseId/content"
                  element={<InstructorRoute element={<AdminCourseContent />} />}
                />
                <Route
                  path="/instructor/course/:courseId/edit"
                  element={<InstructorRoute element={<InstructorCourses />} />}
                />
                <Route
                  path="/instructor/doubts"
                  element={<InstructorRoute element={<InstructorDoubts />} />}
                />
                <Route
                  path="/instructor/settings"
                  element={<InstructorRoute element={<InstructorSettingsPage />} />}
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;