import api from './api';
import { BackendUser, BackendUserRole } from '@/types/auth';

export interface UserLookup {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: BackendUserRole;
  assignedBuses?: string[];
  permissions?: Record<string, any>;
}

export interface UpdateUserRequest {
  username?: string;
  role?: BackendUserRole;
  assignedBuses?: string[];
  permissions?: Record<string, any>;
  isActive?: boolean;
}

export const UserService = {
  // Get all users
  async getAllUsers(): Promise<BackendUser[]> {
    try {
      const response = await api.get('/auth/users');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Create new user
  async createUser(userData: CreateUserRequest): Promise<BackendUser> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<BackendUser> {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/auth/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Toggle user active status
  async toggleUserStatus(userId: string, isActive: boolean): Promise<BackendUser> {
    try {
      const response = await api.patch(`/auth/users/${userId}/status`, { isActive });
      return response.data.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  },

  async getUserByUsername(username: string): Promise<UserLookup | null> {
    try {
      const response = await api.get(`/auth/users/search?username=${encodeURIComponent(username)}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // User not found
      }
      console.error('Error fetching user by username:', error);
      throw error;
    }
  },

  async getUsersByRole(role: 'owner' | 'conductor'): Promise<UserLookup[]> {
    try {
      const response = await api.get(`/auth/users?role=${role}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      throw error;
    }
  },

  async searchUsersByRole(role: 'owner' | 'conductor', searchTerm: string = ''): Promise<UserLookup[]> {
    try {
      // Use the new backend search endpoint for better performance
      const response = await api.get(`/auth/users/search-by-role?role=${role}&username=${encodeURIComponent(searchTerm)}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error searching users by role ${role}:`, error);
      // Fallback to the old method if the new endpoint is not available
      try {
        const users = await this.getUsersByRole(role);
        if (!searchTerm.trim()) {
          return users;
        }
        
        // Filter users by username containing the search term
        return users.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch (fallbackError) {
        console.error(`Fallback search also failed:`, fallbackError);
        throw error;
      }
    }
  }
};
