import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { DeveloperUniverseCanvas } from '../../three/DeveloperUniverse/DeveloperUniverseCanvas';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';
import { GdgUpesLogo } from '../../components/Branding/GdgUpesLogo';

export const StudentLoginPage: React.FC = () => {
  const { student, loading, signInStudent } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scrollProgressRef = useRef(0.75);

  const redirectParam = searchParams.get('redirect');
  const redirectTo =
    redirectParam && redirectParam.startsWith('/student') ? redirectParam : '/student/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && student) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, student, navigate, redirectTo]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    setSubmitting(true);
    const result = await signInStudent({ email, password });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? 'Invalid email address or password.');
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="relative min-h-screen bg-[#080B18] text-slate-100">
      <DeveloperUniverseCanvas scrollProgressRef={scrollProgressRef} showHeroLogo={false} />
      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to GDG UPES Universe
          </Link>
        </div>

        <div className="flex flex-col items-center">
          <div className="mb-5 opacity-85">
            <GdgUpesLogo compact />
          </div>

          <div className="relative overflow-hidden rounded-[24px] reg-card-surface p-7 sm:p-9 w-full max-w-[440px] mx-auto">
            {/* Top-left blue-indigo quarter-circle matching reference screenshot */}
            <div
              className="pointer-events-none absolute -top-14 -left-14 w-40 h-40 rounded-full bg-gradient-to-br from-[#4D58FF] to-[#3640F2] opacity-95"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col items-center text-center mb-6">
              <div className="mb-3" aria-hidden="true">
                <svg width="46" height="36" viewBox="0 0 46 36" fill="none">
                  <defs>
                    <linearGradient id="studentLoginGrad" x1="0" y1="0" x2="46" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#3AD4F5" />
                      <stop offset="50%" stopColor="#5C67F9" />
                      <stop offset="100%" stopColor="#7C2AE8" />
                    </linearGradient>
                  </defs>
                  <circle cx="23" cy="11" r="6.5" fill="url(#studentLoginGrad)" />
                  <path
                    d="M10 31.5C10 25.1487 15.1487 20 21.5 20H24.5C30.8513 20 36 25.1487 36 31.5C36 32.3284 35.3284 33 34.5 33H11.5C10.6716 33 10 32.3284 10 31.5Z"
                    fill="url(#studentLoginGrad)"
                  />
                </svg>
              </div>

              <h1 className="font-display text-2xl font-bold tracking-wide uppercase">
                <span className="text-white">STUDENT </span>
                <span className="text-[#3AD4F5]">SIGN IN</span>
              </h1>
              <p className="mt-1 text-xs text-slate-300">
                Access your GDG on Campus UPES student dashboard & event passes.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} noValidate className="relative z-10 space-y-4">
              <div>
                <label htmlFor="login-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl reg-input-surface px-4 py-3.5 text-sm text-white placeholder:text-[#B8BCC8]"
                />
              </div>

              <div className="relative">
                <label htmlFor="login-password" className="sr-only">
                  Password
                </label>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl reg-input-surface px-4 py-3.5 pr-11 text-sm text-white placeholder:text-[#B8BCC8]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 flex items-start gap-1.5" role="alert">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </p>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wider uppercase text-white reg-cta-gradient cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </div>
            </form>

            <div className="relative z-10 mt-6 text-center text-xs text-slate-300 space-y-2">
              <div>
                <span>Don&apos;t have a student account? </span>
                <Link
                  to={`/student/signup${redirectTo !== '/student/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="font-semibold text-[#3AD4F5] hover:text-white transition-colors"
                >
                  Create Account
                </Link>
              </div>
              <div>
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1 font-semibold text-[#3AD4F5] hover:text-white transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
