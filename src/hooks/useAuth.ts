import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, userApi, setAuthToken, getAuthToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // In a real app, you'd validate the token and get user info
      // For now, we'll assume the token is valid
      setUser({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // In a real app, you'd call your login endpoint
      // For now, we'll simulate a successful login
      const mockToken = 'mock-jwt-token';
      setAuthToken(mockToken);
      setUser({ id: 1, firstName: 'John', lastName: 'Doe', email });
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id'>) => {
    try {
      setLoading(true);
      const newUser = await userApi.create(userData);
      
      // Auto-login after registration
      const mockToken = 'mock-jwt-token';
      setAuthToken(mockToken);
      setUser(newUser);
      
      toast({
        title: 'Registration successful',
        description: 'Welcome to our store!',
      });
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'See you next time!',
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};