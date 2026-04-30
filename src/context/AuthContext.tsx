"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { loginWithGoogle } from '@/services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (accessToken: string) => {
    const jwt = await loginWithGoogle(accessToken);
    const decoded: any = jwtDecode(jwt);

    // Only allow DLSU emails
    if (!decoded.email?.endsWith('@dlsu.edu.ph')) {
      throw new Error('Please use your DLSU email (@dlsu.edu.ph) to sign in.');
    }

    localStorage.setItem('token', jwt);
    const userData: User = {
      email: decoded.email,
      name: `${decoded.givenName || ''} ${decoded.familyName || ''}`.trim(),
      picture: decoded.pictureUrl || '',
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}