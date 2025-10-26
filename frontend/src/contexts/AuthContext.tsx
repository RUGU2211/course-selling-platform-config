import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { loginApi, type LoginResponse } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (user: User, token: string) => void;
  logout: () => void;
}

const LS_AUTH_TOKEN = 'auth_token';
const LS_AUTH_USER = 'auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Initialize from storage
  useEffect(() => {
    const storedToken = localStorage.getItem(LS_AUTH_TOKEN);
    const storedUser = localStorage.getItem(LS_AUTH_USER);
    if (storedToken && storedUser) {
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const loginWithToken = (u: User, token: string) => {
    setIsAuthenticated(true);
    setUser(u);
    localStorage.setItem(LS_AUTH_TOKEN, token);
    localStorage.setItem(LS_AUTH_USER, JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    const res: LoginResponse = await loginApi(email, password);
    if (!res.success || !res.user || !res.token) {
      throw new Error(res.message || 'Login failed');
    }
    const normalizedUser: User = {
      id: String((res.user as any).id),
      email: (res.user as any).email,
      fullName: (res.user as any).fullName,
      role: (res.user as any).role,
    };
    loginWithToken(normalizedUser, res.token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(LS_AUTH_TOKEN);
    localStorage.removeItem(LS_AUTH_USER);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
