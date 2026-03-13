import { FC, MouseEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Menu } from 'lucide-react';
import { DEFAULT_PLATFORM_BRANDING, PLATFORM_BRANDING_UPDATED_EVENT, readPlatformBranding } from '@/lib/platformBranding';

export const Navbar: FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const [branding, setBranding] = useState(DEFAULT_PLATFORM_BRANDING);

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

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      return;
    }

    event.preventDefault();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0f1f54] shadow-sm">
      <div className="flex min-h-16 items-center gap-4 px-4 py-3 sm:px-6">
        {/* Logo and Brand */}
        <Link to="/" onClick={handleLogoClick} className="group flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-white/5">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/95 p-1.5 transition-colors group-hover:bg-white">
            <img src={branding.logo} alt={`${branding.platformName} logo`} className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-semibold tracking-[0.24em] text-slate-300 uppercase">AI Learning Platform</span>
            <span className="text-2xl font-bold text-white transition-colors group-hover:text-blue-200">{branding.platformName}</span>
          </div>
        </Link>

        {user && (
          <button
            onClick={toggleSidebar}
            className="ml-auto inline-flex rounded-xl border border-white/10 p-2 text-white transition-colors hover:bg-white/10 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>
    </nav>
  );
};
