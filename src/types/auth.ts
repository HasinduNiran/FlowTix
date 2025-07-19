export type BackendUserRole = 'admin' | 'owner' | 'manager' | 'conductor';
export type UserRole = 'super-admin' | 'bus-owner' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendUser {
  _id: string;
  username: string;
  role: BackendUserRole;
  assignedBuses?: string[];
  permissions?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
} 