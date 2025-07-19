import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, LoginCredentials, SignupCredentials } from '@/types/auth';
import { AuthService } from '@/services/auth.service';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (name: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const credentials: LoginCredentials = { email: username, password };
      const { user } = await AuthService.login(credentials);
      setUser(user);
      
      // Redirect based on role
      if (user.role === 'super-admin') {
        router.push('/super-admin/dashboard');
      } else if (user.role === 'bus-owner') {
        router.push('/bus-owner/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, username: string, password: string) => {
    setLoading(true);
    try {
      const credentials: SignupCredentials = { name, email: username, password };
      const { user } = await AuthService.signup(credentials);
      setUser(user);
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await AuthService.forgotPassword(email);
    } catch (error) {
      console.error('Forgot password request failed', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        login, 
        signup, 
        logout, 
        forgotPassword, 
        isAuthenticated: AuthService.isAuthenticated() 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 