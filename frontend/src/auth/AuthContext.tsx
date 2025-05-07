import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
// import api from '../services/api'; // We'll create this next

// Define a basic user type, expand as needed
interface User {
  // Define user properties, e.g., id, email, name
  id?: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (access: string, refresh: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!accessToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (accessToken) {
        try {
          // Optionally, validate token or fetch user profile here
          // For now, just assume token is valid if present
          // const response = await api.get('/api/auth/user/'); // Example: fetch user
          // setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // Token might be invalid, clear it
          setAccessToken(null);
          setRefreshToken(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [accessToken]);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    setIsAuthenticated(true);
    // Optionally fetch user profile
    // try {
    //   const response = await api.get('/api/auth/user/');
    //   setUser(response.data);
    // } catch (error) {
    //   console.error("Failed to fetch user after login", error);
    // }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        // Notify backend to invalidate tokens if endpoint exists and handles it
        // await api.post('/api/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
  };

  const getAccessToken = () => accessToken;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, accessToken, refreshToken, user, login, logout, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};