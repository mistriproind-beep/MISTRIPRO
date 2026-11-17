'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminEmail: string;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  adminEmail: '',
  login: async () => ({ success: false }),
  logout: () => {},
  updatePassword: async () => ({ success: false }),
});

const DEFAULT_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@mistripro.com';
const DEFAULT_ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'MistriPro@Admin2026';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const session = localStorage.getItem('mistripro_admin_session');
      if (session) {
        const parsed = JSON.parse(session);
        if (parsed?.authenticated && parsed?.email) {
          setIsAuthenticated(true);
          setAdminEmail(parsed.email);
        }
      }
    } catch {
      // Ignore JSON parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check stored custom password or default credentials
    const storedPass = localStorage.getItem('mistripro_admin_pwd') || DEFAULT_ADMIN_PASS;
    const validEmail = localStorage.getItem('mistripro_admin_user') || DEFAULT_ADMIN_EMAIL;

    if (
      (cleanEmail === validEmail.toLowerCase() || cleanEmail === 'admin@mistripro.com') &&
      cleanPass === storedPass
    ) {
      const sessionData = {
        authenticated: true,
        email: cleanEmail,
        timestamp: Date.now(),
      };
      localStorage.setItem('mistripro_admin_session', JSON.stringify(sessionData));
      setIsAuthenticated(true);
      setAdminEmail(cleanEmail);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid Admin ID or Password. Please check your credentials.',
    };
  };

  const logout = () => {
    localStorage.removeItem('mistripro_admin_session');
    setIsAuthenticated(false);
    setAdminEmail('');
    router.push('/login');
  };

  const updatePassword = async (oldPass: string, newPass: string) => {
    const currentPass = localStorage.getItem('mistripro_admin_pwd') || DEFAULT_ADMIN_PASS;
    if (oldPass !== currentPass) {
      return { success: false, error: 'Current password does not match.' };
    }
    if (newPass.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    localStorage.setItem('mistripro_admin_pwd', newPass);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        adminEmail,
        login,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
