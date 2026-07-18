'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  email: string;
  isLoggedIn: boolean;
  login: (email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('demo@motophd.com');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(sessionStorage.getItem('motophd-logged-in') === '1');
    setEmail(sessionStorage.getItem('motophd-email') || 'demo@motophd.com');
  }, []);

  const login = useCallback((nextEmail: string) => {
    const normalizedEmail = nextEmail || 'demo@motophd.com';
    sessionStorage.setItem('motophd-logged-in', '1');
    sessionStorage.setItem('motophd-email', normalizedEmail);
    setEmail(normalizedEmail);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('motophd-logged-in');
    sessionStorage.removeItem('motophd-email');
    setEmail('demo@motophd.com');
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({ email, isLoggedIn, login, logout }),
    [email, isLoggedIn, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
