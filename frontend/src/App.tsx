import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { useAuthStore } from "./stores/authStore";

import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { Dashboard } from "./pages/Dashboard";
import { Learning } from "./pages/Learning";
import { MyCourses } from "./pages/MyCourses";
import { CourseContent } from "./pages/CourseContent";
import { Certifications } from "./pages/Certifications";
import { ExamProctoring } from "./pages/ExamProctoring";
import { PerformanceAnalytics } from "./pages/PerformanceAnalytics";
import { SettingsPage } from "./pages/Settings";
import OAuthCallback from "./pages/OAuthCallback";

import "./globals.css";

function ProtectedRoute({
  element,
}: {
  element: React.ReactElement;
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  return user ? element : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({
  element,
}: {
  element: React.ReactElement;
}): React.ReactElement {
  const user = useAuthStore((state) => state.user);
  return user ? <Navigate to="/dashboard" replace /> : element;
}

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <div className="flex">
          {user && <Sidebar />}

          <main className={`flex-1 ${user ? "lg:pl-64" : ""}`}>
            <div className={user ? "p-6 max-w-7xl mx-auto" : ""}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
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
                  element={<ProtectedRoute element={<Dashboard />} />}
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
                  element={<ProtectedRoute element={<SettingsPage />} />}
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