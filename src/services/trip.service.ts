import api from './api';

export interface Trip {
  _id: string;
  tripNumber: string;
  route: string;
  bus: string;
  conductor: string;
  departureTime: Date;
  arrivalTime?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  availableSeats: number;
  totalSeats: number;
  createdAt: string;
  updatedAt: string;
}

export const TripService = {
  async getAllTrips(filters?: { routeId?: string; status?: string; date?: string }): Promise<Trip[]> {
    try {
      const response = await api.get('/trips', { params: filters });
      return response.data.data;
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
  
  async createTrip(tripData: Omit<Trip, '_id' | 'createdAt' | 'updatedAt'>): Promise<Trip> {
    try {
      const response = await api.post('/trips', tripData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },
  
  async updateTrip(id: string, tripData: Partial<Omit<Trip, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Trip> {
    try {
      const response = await api.put(`/trips/${id}`, tripData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating trip with id ${id}:`, error);
      throw error;
    }
  },
  
  async startTrip(id: string): Promise<Trip> {
    try {
      const response = await api.patch(`/trips/${id}/start`);
      return response.data.data;
    } catch (error) {
      console.error(`Error starting trip with id ${id}:`, error);
      throw error;
    }
  },
  
  async completeTrip(id: string): Promise<Trip> {
    try {
      const response = await api.patch(`/trips/${id}/complete`);
      return response.data.data;
    } catch (error) {
      console.error(`Error completing trip with id ${id}:`, error);
      throw error;
    }
  },
  
  async cancelTrip(id: string): Promise<Trip> {
    try {
      const response = await api.patch(`/trips/${id}/cancel`);
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling trip with id ${id}:`, error);
      throw error;
    }
  },
  
  async getAvailableSeats(tripId: string): Promise<{ seatNumber: string; isAvailable: boolean }[]> {
    try {
      const response = await api.get(`/trips/${tripId}/seats`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching available seats for trip ${tripId}:`, error);
      throw error;
    }
  }
}; 