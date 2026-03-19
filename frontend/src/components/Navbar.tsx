import { FC, MouseEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Menu } from 'lucide-react';
import { DEFAULT_PLATFORM_BRANDING, PLATFORM_BRANDING_UPDATED_EVENT, readPlatformBranding } from '@/lib/platformBranding';
import { Button } from '@/components/ui/button';

export const Navbar: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [branding, setBranding] = useState(DEFAULT_PLATFORM_BRANDING);
  const [logoSrc, setLogoSrc] = useState(DEFAULT_PLATFORM_BRANDING.logo);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  useEffect(() => {
    setBranding(readPlatformBranding());

    const syncBranding = () => setBranding(readPlatformBranding());
    window.addEventListener('storage', syncBranding);
    window.addEventListener(PLATFORM_BRANDING_UPDATED_EVENT, syncBranding);

    return () => {
      window.removeEventListener('storage', syncBranding);
      window.removeEventListener(PLATFORM_BRANDING_UPDATED_EVENT, syncBranding);
    };
  }, []);

  useEffect(() => {
    setLogoSrc(branding.logo || DEFAULT_PLATFORM_BRANDING.logo);
    setLogoLoadFailed(false);
  }, [branding]);

  const handleLogoError = () => {
    if (logoSrc !== DEFAULT_PLATFORM_BRANDING.logo) {
      setLogoSrc(DEFAULT_PLATFORM_BRANDING.logo);
      return;
    }

    setLogoLoadFailed(true);
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      return;
    }

    event.preventDefault();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0f1f54] shadow-sm">
      <div className="flex min-h-16 items-center gap-4 px-4 py-3 sm:px-6">
        {/* Logo and Brand */}
        <Link to="/" onClick={handleLogoClick} className="group flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-white/5">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-1.5 transition-colors group-hover:bg-white">
            {logoLoadFailed ? (
              <div className="flex h-full w-full items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                SF
              </div>
            ) : (
              <img
                src={logoSrc}
                alt={`${branding.platformName} logo`}
                className="h-full w-full object-contain"
                onError={handleLogoError}
              />
            )}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-semibold tracking-[0.24em] text-slate-300 uppercase">AI Learning Platform</span>
            <span className="text-2xl font-bold text-white transition-colors group-hover:text-blue-200">{branding.platformName}</span>
          </div>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {!user && (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={toggleSidebar}
              className="inline-flex rounded-xl border border-white/10 p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
