import { FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { normalizeRole } from '@/lib/authRole.ts';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Users,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Courses', href: '/courses' },
  { icon: BookOpen, label: 'My Courses', href: '/my-courses' },
  { icon: HelpCircle, label: 'My Doubts', href: '/doubts' },
  { icon: Award, label: 'Certifications', href: '/certifications' },
  { icon: BarChart3, label: 'Analytics', href: '/performance' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Users, label: 'User & Instructor Mgmt', href: '/admin/users' },
  { icon: BookOpen, label: 'Course Management', href: '/admin/courses' },
  { icon: HelpCircle, label: 'Doubts & Queries', href: '/admin/doubts' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const instructorNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/instructor/dashboard' },
  { icon: BookOpen, label: 'My Courses', href: '/instructor/courses' },
  { icon: HelpCircle, label: 'Student Doubts', href: '/instructor/doubts' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar: FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const userRole = normalizeRole(user.role);

  // Select navigation items based on user role
  let currentNavItems = navItems;
  if (userRole === 'admin') {
    currentNavItems = adminNavItems;
  } else if (userRole === 'instructor') {
    currentNavItems = instructorNavItems;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] border-r border-blue-200 bg-gradient-to-b from-blue-50 via-slate-50 to-slate-100 transition-all duration-300 lg:static lg:block ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col h-full gap-3">
          {/* Collapse Toggle */}
          <div className="flex justify-end px-3 pt-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-blue-200 rounded-lg transition-colors hidden lg:block text-slate-700"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 px-3 flex-1">
            {currentNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              const colors = ['from-blue-600 to-blue-700', 'from-purple-600 to-purple-700', 'from-cyan-600 to-cyan-700', 'from-indigo-600 to-indigo-700', 'from-violet-600 to-violet-700'];
              const colorBg = colors[idx % colors.length];
              
              return (
                <Link key={item.href} to={item.href} title={isCollapsed ? item.label : ''}>
                  <Button
                    className={`w-full transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${colorBg} text-white shadow-md hover:shadow-lg ${isCollapsed ? 'px-2' : 'justify-start gap-3'}` 
                        : `text-slate-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 ${isCollapsed ? 'px-2' : 'justify-start gap-3'}`
                    }`}
                    variant="ghost"
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex flex-col gap-2 border-t border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mx-3 mb-3 shadow-sm">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md">
                {user.name?.[0] || '?'}
              </div>
              {!isCollapsed && (
                <div className="hidden sm:block flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{user.name}</div>
                  <div className="text-xs text-slate-600 truncate">{user.email}</div>
                </div>
              )}
            </div>
            <Button
              className={`w-full bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md transition-all duration-300 ${isCollapsed ? 'px-2' : 'justify-start gap-3'}`}
              size="sm"
              onClick={() => {
                logout();
              }}
              title={isCollapsed ? 'Logout' : ''}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
