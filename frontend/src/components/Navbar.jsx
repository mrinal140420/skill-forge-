import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Settings } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  if (isAuthenticated) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center group">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SkillForge
                </span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/my-courses"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                My Courses
              </Link>
              <Link
                to="/performance"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Analytics
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'Profile'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Settings size={16} />
                    <span className="text-sm">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition border-t border-gray-200"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                to="/my-courses"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                My Courses
              </Link>
              <Link
                to="/performance"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Analytics
              </Link>
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // Public Navigation
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillForge
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/courses"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Explore Courses
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/courses"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Explore Courses
            </Link>
            <div className="flex gap-2 pt-2">
              <Button
                asChild
                variant="outline"
                className="flex-1 border-gray-300"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
