import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthResponse } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  kycTier: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      console.log('Initializing auth, token exists:', !!token);
      
      if (token) {
        const response = await apiService.getProfile();
        if (response.data) {
          setUser(response.data);
          console.log('User profile loaded:', response.data);
        } else {
          console.log('Failed to load profile, clearing tokens');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login for:', email);
    setIsLoading(true);
    
    const response = await apiService.login({ email, password });
    console.log('Login response:', response);
    
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      setIsLoading(false);
      return true;
    } else {
      console.error('Login failed:', response.error);
      toast({
        title: "Login failed",
        description: response.error || "Please check your credentials",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }): Promise<boolean> => {
    console.log('Attempting registration for:', userData.email);
    setIsLoading(true);
    
    const response = await apiService.register(userData);
    console.log('Registration response:', response);
    
    if (response.data) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
      toast({
        title: "Registration successful",
        description: "Welcome to PayFlow!",
      });
      setIsLoading(false);
      return true;
    } else {
      console.error('Registration failed:', response.error);
      toast({
        title: "Registration failed",
        description: response.error || "Please try again. Make sure backend services are running.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await apiService.logout();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
