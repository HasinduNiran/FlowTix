import api from './api';

export interface Bus {
  _id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  isActive: boolean;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export const BusService = {
  async getAllBuses(): Promise<Bus[]> {
    try {
      const response = await api.get('/buses');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching buses:', error);
      throw error;
    }
  },
  
  async getBusById(id: string): Promise<Bus> {
    try {
      const response = await api.get(`/buses/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching bus with id ${id}:`, error);
      throw error;
    }
  },
  
  async createBus(busData: Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>): Promise<Bus> {
    try {
      const response = await api.post('/buses', busData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating bus:', error);
      throw error;
    }
  },
  
  async updateBus(id: string, busData: Partial<Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Bus> {
    try {
      const response = await api.put(`/buses/${id}`, busData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating bus with id ${id}:`, error);
      throw error;
    }
  },
  
  async deleteBus(id: string): Promise<void> {
    try {
      await api.delete(`/buses/${id}`);
    } catch (error) {
      console.error(`Error deleting bus with id ${id}:`, error);
      throw error;
    }
  }
}; 