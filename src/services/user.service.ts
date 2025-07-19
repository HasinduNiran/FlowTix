import api from './api';

export interface UserLookup {
  _id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export const UserService = {
  async getUserByUsername(username: string): Promise<UserLookup | null> {
    try {
      const response = await api.get(`/users/search?username=${encodeURIComponent(username)}`);
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
      const response = await api.get(`/users?role=${role}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching users by role ${role}:`, error);
      throw error;
    }
  }
};
