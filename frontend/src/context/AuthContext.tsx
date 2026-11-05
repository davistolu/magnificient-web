import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mag_auth_token'));
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mag_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Start with loading true only if we have a token but haven't loaded the user from cache yet
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const hasToken = Boolean(localStorage.getItem('mag_auth_token'));
    const hasUser = Boolean(localStorage.getItem('mag_auth_user'));
    return hasToken && !hasUser;
  });

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await api.getMe();
        if (isMounted) {
          if (res?.success && res?.user) {
            setUser(res.user);
            localStorage.setItem('mag_auth_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        }
      } catch (err: any) {
        // Only invalidate session if the backend explicitly rejected the token with 401 Unauthorized
        if (err?.status === 401) {
          if (isMounted) {
            logout();
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('mag_auth_token', newToken);
    localStorage.setItem('mag_auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('mag_auth_token');
    localStorage.removeItem('mag_auth_user');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
