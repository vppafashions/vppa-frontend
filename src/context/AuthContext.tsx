import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { OAuthProvider, type Models } from 'appwrite';
import { account } from '../lib/appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loginWithGoogle: () => {},
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

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
