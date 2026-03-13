import { FC, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/api/apiClient';
import { getRoleBasedRedirectPath } from '@/lib/authRole';
import { Github, Globe, CheckCircle2, XCircle } from 'lucide-react';

const PASSWORD_RULES = {
  minLength: { rule: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  hasUppercase: { rule: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  hasLowercase: { rule: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  hasNumber: { rule: (p: string) => /\d/.test(p), label: 'One number' },
  hasSpecial: { rule: (p: string) => /[!@#$%^&*]/.test(p), label: 'One special character (!@#$%^&*)' },
};

export const Register: FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setError, error, loading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let strength = 0;
    Object.values(PASSWORD_RULES).forEach((rule) => {
      if (rule.rule(password)) strength++;
    });
    return strength;
  }, [formData.password]);

  const isPasswordValid = passwordStrength === Object.keys(PASSWORD_RULES).length;

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(null);
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!isPasswordValid) {
      setError('Password does not meet all requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data } = await apiClient.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
      // Store JWT token
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
      }
      if (data.user) {
        setUser(data.user);
        navigate(getRoleBasedRedirectPath(data.user.role));
        return;
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    }
  };

  const handleOAuth = (provider: string) => {
    window.location.href = `http://localhost:8081/oauth2/authorization/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Card className="w-full max-w-lg border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Create Your Account</CardTitle>
          <CardDescription className="text-slate-400">Join 50,000+ students mastering computer science</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-200">Email</Label>
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
              <Label htmlFor="password" className="text-slate-200">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />

              {formData.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all`}
                        style={{ width: `${(passwordStrength / Object.keys(PASSWORD_RULES).length) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${
                      passwordStrength <= 2 ? 'text-red-400' :
                      passwordStrength <= 3 ? 'text-yellow-400' :
                      passwordStrength <= 4 ? 'text-blue-400' :
                      'text-green-400'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {Object.entries(PASSWORD_RULES).map(([key, rule]) => {
                      const isMet = rule.rule(formData.password);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          {isMet ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          )}
                          <span className={isMet ? 'text-green-400' : 'text-slate-400'}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-400 mt-1">✓ Passwords match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading || !isPasswordValid || !formData.name || !formData.email}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or sign up with</span>
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
            <span className="text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
