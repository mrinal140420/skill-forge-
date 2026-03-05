import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'My Courses', href: '/my-courses' },
  { icon: Award, label: 'Certifications', href: '/certifications' },
  { icon: BarChart3, label: 'Analytics', href: '/performance' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar: FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  if (!user) return null;

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
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-64px)] w-64 border-r border-border bg-card transition-all duration-300 lg:static lg:block ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full p-6 gap-8">
          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Section */}
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <div className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                {user.name?.[0] || '?'}
              </div>
              <div className="hidden sm:block flex-1">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="justify-start gap-3"
              onClick={() => {
                logout();
              }}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
