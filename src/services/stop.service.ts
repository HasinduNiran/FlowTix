import api from './api';

export interface Stop {
  _id: string;
  stopCode: string;
  stopName: string;
  sectionNumber: number;
  routeId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStopData {
  stopCode: string;
  stopName: string;
  sectionNumber: number;
  routeId: string;
  isActive?: boolean;
}

export interface UpdateStopData extends Partial<CreateStopData> {}

export const StopService = {
  // Get all stops
  async getAllStops(): Promise<Stop[]> {
    try {
      const response = await api.get('/stops');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching stops:', error);
      throw error;
    }
  },

  // Get stops by route ID
  async getStopsByRoute(routeId: string): Promise<Stop[]> {
    try {
      const response = await api.get(`/stops/route/${routeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching stops by route:', error);
      throw error;
    }
  },

  // Get stop by ID
  async getStopById(id: string): Promise<Stop> {
    try {
      const response = await api.get(`/stops/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching stop:', error);
      throw error;
    }
  },

  // Get stop by code
  async getStopByCode(stopCode: string): Promise<Stop> {
    try {
      const response = await api.get(`/stops/code/${stopCode}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching stop by code:', error);
      throw error;
    }
  },

  // Create stop
  async createStop(data: CreateStopData): Promise<Stop> {
    try {
      const response = await api.post('/stops', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating stop:', error);
      throw error;
    }
  },

  // Update stop
  async updateStop(id: string, data: UpdateStopData): Promise<Stop> {
    try {
      const response = await api.put(`/stops/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating stop:', error);
      throw error;
    }
  },

  // Delete stop
  async deleteStop(id: string): Promise<void> {
    try {
      await api.delete(`/stops/${id}`);
    } catch (error) {
      console.error('Error deleting stop:', error);
      throw error;
    }
  }
};

export default StopService;
