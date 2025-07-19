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
  },

  async searchUsersByRole(role: 'owner' | 'conductor', searchTerm: string = ''): Promise<UserLookup[]> {
    try {
      // Use the new backend search endpoint for better performance
      const response = await api.get(`/users/search-by-role?role=${role}&username=${encodeURIComponent(searchTerm)}`);
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
