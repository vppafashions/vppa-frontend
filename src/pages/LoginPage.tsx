import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AuthTab = 'login' | 'register' | 'magic-link';

export function LoginPage() {
  const { user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, sendMagicLink } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await registerWithEmail(email, password, name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await sendMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send magic link. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-20">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="font-magazine text-5xl tracking-tight mb-3">VPPA</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Luxury Menswear
          </p>
        </div>

        <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
          <h2 className="text-xl font-light text-center mb-2">Welcome</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Sign in to access your account, wishlist, and orders
          </p>

          {/* Google Login */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-200 rounded-full py-3.5 px-6 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border/30" />
            <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-border/30" />
          </div>

          {/* Tabs */}
          <div className="flex border border-border/30 rounded-full p-1 mb-6">
            {([
              { key: 'login' as AuthTab, label: 'Sign In' },
              { key: 'register' as AuthTab, label: 'Register' },
              { key: 'magic-link' as AuthTab, label: 'Magic Link' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); setMagicLinkSent(false); }}
                className={`flex-1 text-xs py-2 rounded-full transition-all duration-200 ${
                  tab === key
                    ? 'bg-foreground text-background font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Email/Password Login */}
          {tab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                  placeholder="Min 8 characters"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50"
              >
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Magic Link */}
          {tab === 'magic-link' && (
            <>
              {magicLinkSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-foreground/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Check your email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
                  </p>
                  <button
                    onClick={() => setMagicLinkSent(false)}
                    className="text-sm text-muted-foreground underline hover:text-foreground"
                  >
                    Send again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center mb-2">
                    Enter your email and we'll send you a magic link to sign in — no password needed.
                  </p>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                      placeholder="your@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Magic Link'}
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-muted-foreground text-xs text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
