'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { loginWithGoogle } from '@/services/api';
import { JwtPayload, jwtDecode } from 'jwt-decode';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  /** DB primary key — needed for /users/:id/* routes */
  dbId: number | null;
  email: string;
  name: string;
  picture: string;
  /** DLSU student/employee ID, saved separately via PUT /users/:id/id-number */
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
}

/**
 * The JWT our backend signs contains these fields (note: camelCase from the
 * backend, NOT the snake_case field names that Google's own JWT uses).
 */
interface BackendJwtPayload extends JwtPayload {
  /** DB primary key */
  uid?: number | null;
  email?: string;
  givenName?: string;
  familyName?: string;
  userId?: string;
  pictureUrl?: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (accessToken: string) => {
    // 1. Exchange Google access token for our app's JWT
    const jwt = await loginWithGoogle(accessToken);

    // 2. Decode the JWT our backend signed
    const decoded = jwtDecode<BackendJwtPayload>(jwt);

    // 3. Enforce DLSU-only emails
    if (!decoded.email?.endsWith('@dlsu.edu.ph')) {
      throw new Error(
        'Please use your DLSU email (@dlsu.edu.ph) to sign in.',
      );
    }

    // 4. Persist token
    localStorage.setItem('token', jwt);

    // 5. Build user object using the BACKEND field names (givenName, not given_name)
    const userData: AuthUser = {
      dbId: decoded.uid ?? null,
      email: decoded.email,
      name: `${decoded.givenName ?? ''} ${decoded.familyName ?? ''}`.trim(),
      picture: decoded.pictureUrl ?? '',
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

  /** Call this after successfully updating the ID number via the API. */

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
