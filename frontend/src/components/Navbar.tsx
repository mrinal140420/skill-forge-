import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Menu, LogOut, Home } from 'lucide-react';

export const Navbar: FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-card">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span>SF</span>
          </div>
          <span className="hidden sm:inline">SkillForge</span>
        </Link>

        {/* Navigation Links (Public) */}
        {!user && (
          <div className="ml-auto flex items-center gap-2">
            <Link to="/courses">
              <Button variant="ghost" size="sm">
                Explore
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        )}

        {/* Navigation Links (Authenticated) */}
        {user && (
          <>
            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="ml-auto inline-flex lg:hidden rounded-lg p-2 hover:bg-muted"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* User Actions */}
          </>
        )}
      </div>
    </nav>
  );
};
