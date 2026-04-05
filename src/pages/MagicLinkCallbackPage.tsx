import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function MagicLinkCallbackPage() {
  const { confirmMagicLink } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');

    if (userId && secret) {
      confirmMagicLink(userId, secret)
        .then(() => {
          navigate('/');
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Magic link verification failed. Please try again.';
          setError(msg);
        });
    } else {
      setError('Invalid magic link. Please request a new one.');
    }
  }, [searchParams, confirmMagicLink, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="w-full max-w-md mx-auto px-6 text-center">
          <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium mb-2">Verification Failed</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
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
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Verifying magic link...</p>
      </div>
    </div>
  );
}
