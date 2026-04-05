import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ResetPasswordPage() {
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }
    if (!userId || !secret) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(userId, secret, password);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password reset failed. The link may have expired.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="w-full max-w-md mx-auto px-6 text-center">
          <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-lg font-medium mb-2">Password Reset Successful</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-foreground text-background py-3 px-8 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userId || !secret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="w-full max-w-md mx-auto px-6 text-center">
          <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium mb-2">Invalid Reset Link</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-foreground text-background py-3 px-8 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
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
          <h2 className="text-xl font-light text-center mb-2">Set New Password</h2>
          <p className="text-muted-foreground text-sm text-center mb-6">
            Enter your new password below
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                New Password
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
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-background border border-border/30 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="Confirm your new password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-foreground text-background py-3.5 rounded-full text-sm font-medium hover:opacity-90 transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
