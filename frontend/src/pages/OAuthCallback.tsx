import { FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getRoleBasedRedirectPath, normalizeRole } from '@/lib/authRole';
import { Loader2 } from 'lucide-react';

/**
 * OAuth Callback Page
 *
 * Handles the redirect from the backend after successful OAuth2 authentication.
 * The backend redirects here with query params: token, userId, name, email, role.
 * This page extracts those, stores them in the auth store, and redirects by role.
 */
const OAuthCallback: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(
        errorParam === 'no_email'
          ? 'Could not retrieve email from your account. Please ensure your email is public or try a different provider.'
          : `Authentication failed: ${errorParam}`
      );
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (token && userId && email) {
      // Store the token
      setToken(token);
      localStorage.setItem('authToken', token);

      const normalizedRole = normalizeRole(role || 'student');

      // Store user info
      setUser({
        id: userId,
        email,
        name: name || email.split('@')[0],
        role: normalizedRole,
      });

      navigate(getRoleBasedRedirectPath(normalizedRole), { replace: true });
    } else {
      setError('Invalid OAuth callback — missing token or user info.');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">{error}</p>
          <p className="text-slate-400 text-sm">Redirecting to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
          <p className="text-slate-300 text-lg">Signing you in...</p>
        </div>
      )}
    </div>
  );
};

export default OAuthCallback;

