import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { OAuthProvider, type Models } from 'appwrite';
import { account } from '../lib/appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  confirmMagicLink: (userId: string, secret: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loginWithGoogle: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loginWithEmail: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerWithEmail: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  sendMagicLink: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  confirmMagicLink: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loginWithGoogle = () => {
    const currentUrl = window.location.origin;
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${currentUrl}/`,
      `${currentUrl}/login`
    );
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await account.deleteSession('current');
    } catch {
      // No existing session to clear
    }
    await account.createEmailPasswordSession(email, password);
    const currentUser = await account.get();
    setUser(currentUser);
  };

  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      await account.deleteSession('current');
    } catch {
      // No existing session to clear
    }
    await account.create('unique()', email, password, name);
    await account.createEmailPasswordSession(email, password);
    const currentUser = await account.get();
    setUser(currentUser);
  };

  const sendMagicLink = async (email: string) => {
    const currentUrl = window.location.origin;
    await account.createMagicURLToken(
      'unique()',
      email,
      `${currentUrl}/magic-link-callback`
    );
  };

  const confirmMagicLink = async (userId: string, secret: string) => {
    try {
      await account.deleteSession('current');
    } catch {
      // No existing session to clear — that's fine
    }
    await account.createSession(userId, secret);
    const currentUser = await account.get();
    setUser(currentUser);
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, sendMagicLink, confirmMagicLink, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
