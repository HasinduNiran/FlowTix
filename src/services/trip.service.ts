import api from './api';

export interface TripStopSection {
  routeSectionId: string;
  sectionName: string;
  sectionNumber: number;
}

export interface Trip {
  _id: string;
  busId: string | any; // Can be populated
  routeId: string | any; // Can be populated
  tripNumber: number;
  direction: 'forward' | 'return';
  startTime: Date | string;
  endTime?: Date | string;
  date: Date | string;
  fromStopSection: TripStopSection;
  toStopSection?: TripStopSection;
  cashInHand: number;
  totalFare: number;
  passengerCount: number;
  difference: number;
  createdAt: string;
  updatedAt: string;
}

export const TripService = {
  async getAllTrips(filters?: { busId?: string; routeId?: string; date?: string; page?: number; limit?: number; sort?: string }): Promise<Trip[]> {
    try {
      const params: any = {};
      
      if (filters?.date) {
        params.startDate = filters.date;
        params.endDate = filters.date;
      }
      if (filters?.busId) params.busId = filters.busId;
      if (filters?.routeId) params.routeId = filters.routeId;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.sort) params.sort = filters.sort;

      const response = await api.get('/trips', { params });
      
      // Backend returns { success: true, total, page, limit, totalPages, data: trips[] }
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },
  
  async getTripById(id: string): Promise<Trip> {
    try {
      const response = await api.get(`/trips/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching trip with id ${id}:`, error);
      throw error;
    }
  },
  
  async getActiveTripForBus(busId: string): Promise<Trip | null> {
    try {
      const response = await api.get(`/trips/active/bus/${busId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active trip found
      }
      console.error(`Error fetching active trip for bus ${busId}:`, error);
      throw error;
    }
  },
  
  async startTrip(tripData: any): Promise<Trip> {
    try {
      const response = await api.post('/trips/start', tripData);
      return response.data.data;
    } catch (error) {
      console.error('Error starting trip:', error);
      throw error;
    }
  },
  
  async endTrip(id: string, endData?: any): Promise<Trip> {
    try {
      const response = await api.post(`/trips/end/${id}`, endData || {});
      return response.data.data;
    } catch (error) {
      console.error(`Error ending trip with id ${id}:`, error);
      throw error;
    }
  },
  
  async deleteTrip(id: string): Promise<void> {
    try {
      await api.delete(`/trips/${id}`);
    } catch (error) {
      console.error(`Error deleting trip with id ${id}:`, error);
      throw error;
    }
  }
}; 