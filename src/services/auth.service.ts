import api from './api';
import Cookies from 'js-cookie';
import { LoginCredentials, SignupCredentials, User } from '@/types/auth';

const AUTH_TOKEN_KEY = 'auth-token';
const USER_KEY = 'user';

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.email,
        password: credentials.password
      });
      
      const { accessToken, user } = response.data.data;
      
      // Store authentication data
      Cookies.set(AUTH_TOKEN_KEY, accessToken, { expires: 1 }); // 1 day
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Map backend user role to frontend user role
      const mappedUser: User = {
        id: user._id,
        email: user.username,
        name: user.username,
        role: this.mapBackendRoleToFrontend(user.role),
        assignedBuses: user.assignedBuses || []
      };
      
      return { user: mappedUser, token: accessToken };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  },
  
  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    try {
      // In a real implementation, you would call the backend register endpoint
      // For now, we'll simulate a successful signup with the login endpoint
      const response = await api.post('/auth/login', {
        username: credentials.email,
        password: credentials.password
      });
      
      const { accessToken, user } = response.data.data;
      
      // Store authentication data
      Cookies.set(AUTH_TOKEN_KEY, accessToken, { expires: 1 }); // 1 day
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      // Map backend user role to frontend user role
      const mappedUser: User = {
        id: user._id,
        email: user.username,
        name: credentials.name,
        role: this.mapBackendRoleToFrontend(user.role),
        assignedBuses: user.assignedBuses || []
      };
      
      return { user: mappedUser, token: accessToken };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Signup failed. Please try again.');
    }
  },
  
  async forgotPassword(email: string): Promise<void> {
    try {
      // This endpoint doesn't exist yet in the backend
      // await api.post('/auth/forgot-password', { email });
      
      // For now, we'll just simulate a successful request
      return Promise.resolve();
    } catch (error) {
      throw new Error('Failed to send password reset email. Please try again.');
    }
  },
  
  async refreshToken(): Promise<string> {
    try {
      // The refreshToken is sent in HTTP-only cookie automatically
      const response = await api.post('/auth/refresh-token');
      const { accessToken } = response.data.data;
      
      // Store the new access token
      Cookies.set(AUTH_TOKEN_KEY, accessToken, { expires: 7 });
      return accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clean up on failed refresh
      this.logout();
      throw new Error('Session expired. Please login again.');
    }
  },
  
  logout(): void {
    // Call the backend logout endpoint if the user is authenticated
    if (this.isAuthenticated()) {
      api.post('/auth/logout').catch(console.error);
    }
    
    Cookies.remove(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      
      // Map backend user role to frontend user role
      return {
        id: user._id,
        email: user.username,
        name: user.username,
        role: this.mapBackendRoleToFrontend(user.role),
        assignedBuses: user.assignedBuses || []
      };
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  },
  
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return !!Cookies.get(AUTH_TOKEN_KEY);
  },
  
  // Helper method to map backend roles to frontend roles
  mapBackendRoleToFrontend(backendRole: string): 'user' | 'bus-owner' | 'manager' | 'super-admin' {
    switch (backendRole) {
      case 'admin':
        return 'super-admin';
      case 'owner':
        return 'bus-owner';
      case 'manager':
        return 'manager';
      case 'conductor':
      default:
        return 'user';
    }
  }
}; 