import { FC, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/api/apiClient';
import { Github, Globe, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Login: FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setError, error, loading } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    useAuthStore.getState().setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.post('/api/auth/login', formData);
      
      // Store JWT token in both store and localStorage
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        setUser(data.user);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid email or password');
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-lg border-slate-700 bg-slate-800 relative z-10">
        <CardHeader>
          <CardTitle className="text-white">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400">Sign in to your SkillForge account to continue learning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-slate-200">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => handleOAuth('google')} className="border-slate-600 text-black-200 hover:bg-slate-700">
              <Globe className="h-4 w-4 mr-2" />
              Google
            </Button>
            <Button variant="outline" onClick={() => handleOAuth('github')} className="border-slate-600 text-black-200 hover:bg-slate-700">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-400">Don't have an account? </span>
            <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold">
              Sign up free
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
