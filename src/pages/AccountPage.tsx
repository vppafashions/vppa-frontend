import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AccountPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="font-magazine text-4xl tracking-tight mb-8">My Account</h1>

        <div className="border border-border/30 rounded-2xl p-8 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-medium">{user.name || 'User'}</h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-3 border-b border-border/20">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/20">
              <span className="text-muted-foreground text-sm">Name</span>
              <span className="text-sm">{user.name || '—'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border/20">
              <span className="text-muted-foreground text-sm">Member since</span>
              <span className="text-sm">{new Date(user.$createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full py-3 px-6 border border-border/30 rounded-full text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
