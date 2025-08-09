import api from './api';

export interface Route {
  _id: string;
  routeName: string;
  routeNumber: string;
  startLocation?: string;
  endLocation?: string;
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  role: string;
  fullName?: string;
}

export interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
  telephoneNumber: string;
  category: string;
  ownerId: string | User;
  routeId: string | Route;
  seatCapacity: number;
  driverName: string;
  conductorId: string | User;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
  lastDayEndDate?: string;
  resetTripCounter?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BusService = {
  async getAllBuses(): Promise<Bus[]> {
    try {
      const response = await api.get('/buses?limit=9999');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching buses:', error);
      throw error;
    }
  },

  async getBusesWithPagination(page: number = 1, limit: number = 15, filters?: {category?: string, search?: string}): Promise<{buses: Bus[], count: number, totalPages: number, currentPage: number, totalCount: number}> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      
      if (filters?.search && filters.search !== '') {
        params.append('search', filters.search);
      }
      
      const response = await api.get(`/buses?${params.toString()}`);
      return {
        buses: response.data.data,
        count: response.data.count || response.data.data.length,
        totalPages: response.data.totalPages || Math.ceil((response.data.totalCount || response.data.data.length) / limit),
        currentPage: response.data.currentPage || page,
        totalCount: response.data.totalCount || response.data.data.length
      };
    } catch (error) {
      console.error('Error fetching buses with pagination:', error);
      throw error;
    }
  },

  async getAllBusesCount(): Promise<{totalBuses: number, busesByCategory: Record<string, number>}> {
    try {
      const response = await api.get('/buses/counts');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching bus counts:', error);
      // Fallback: if counts endpoint doesn't exist, fetch all buses and count manually
      try {
        const allBuses = await this.getAllBuses();
        const busesByCategory = allBuses.reduce((acc, bus) => {
          acc[bus.category] = (acc[bus.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        return {
          totalBuses: allBuses.length,
          busesByCategory
        };
      } catch (fallbackError) {
        console.error('Error in fallback bus count:', fallbackError);
        throw error;
      }
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
  },

  async getBusesByOwner(ownerId: string): Promise<Bus[]> {
    try {
      console.log('Fetching buses for owner:', ownerId);
      const response = await api.get(`/buses/owner/${ownerId}`);
      console.log('Buses response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching buses for owner ${ownerId}:`, error);
      throw error;
    }
  },

  async updateBusStatus(busId: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Bus> {
    try {
      const response = await api.put(`/buses/${busId}`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating bus status for bus ${busId}:`, error);
      throw error;
    }
  },

  async getAvailableBusesForAssignment(excludeUserId?: string): Promise<Bus[]> {
    try {
      const params = excludeUserId ? `?excludeUser=${excludeUserId}` : '';
      const response = await api.get(`/buses/available-for-assignment${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching available buses for assignment:', error);
      throw error;
    }
  }
}; 