import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, LoginCredentials, SignupCredentials } from '@/types/auth';
import { AuthService } from '@/services/auth.service';
import Cookies from 'js-cookie';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (name: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  refreshToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh the token
  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      return await AuthService.refreshToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // If the user is logged in, schedule a token refresh check
      const token = Cookies.get('auth-token');
      if (token) {
        // Try to refresh the token if it's close to expiration
        // We'll assume tokens last for 15 minutes and refresh after 10 minutes
        setTimeout(() => {
          refreshToken();
        }, 10 * 60 * 1000); // 10 minutes
      }
    }
    setLoading(false);
  }, [refreshToken]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const credentials: LoginCredentials = { email: username, password };
      const { user } = await AuthService.login(credentials);
      setUser(user);
      
      // Schedule token refresh
      setTimeout(() => {
        refreshToken();
      }, 10 * 60 * 1000); // 10 minutes
      
      // Redirect based on role
      if (user.role === 'super-admin') {
        router.push('/super-admin/dashboard');
      } else if (user.role === 'bus-owner') {
        router.push('/bus-owner/dashboard');
      } else if (user.role === 'manager') {
        router.push('/manager/dashboard');
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
        refreshToken,
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