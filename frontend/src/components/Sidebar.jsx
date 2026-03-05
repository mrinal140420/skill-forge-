import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Home,
  BookOpen,
  Award,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const Sidebar = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Show sidebar on protected routes when authenticated
  const protectedRoutes = [
    '/dashboard',
    '/my-courses',
    '/courses',
    '/course-detail',
    '/course-content',
    '/learning',
    '/certifications',
    '/exam',
    '/performance',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    location.pathname.includes(route)
  );

  if (!isAuthenticated || !isProtectedRoute) {
    return null;
  }

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/courses', icon: BookOpen, label: 'Browse Courses' },
    { path: '/my-courses', icon: GraduationCap, label: 'My Courses' },
    {
      path: '/certifications',
      icon: Award,
      label: 'Certifications',
    },
    { path: '/exam', icon: FileText, label: 'Take an Exam' },
    { path: '/performance', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div
      className={`fixed left-0 top-16 bottom-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 border-r border-slate-700 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-blue-600 hover:bg-blue-700 rounded-full p-1.5 transition shadow-lg z-50"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        {isCollapsed ? (
          <ChevronRight size={18} className="text-white" />
        ) : (
          <ChevronLeft size={18} className="text-white" />
        )}
      </button>

      {/* Navigation */}
      <nav className="pt-4 px-2 space-y-1 overflow-y-auto h-full pb-20">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
