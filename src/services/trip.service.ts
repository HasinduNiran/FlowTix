import api from './api';
import { BusService } from './bus.service';

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
  status?: 'active' | 'completed';
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
  },

  async getTripsByOwner(ownerId: string, filters?: { date?: string; busId?: string; page?: number; limit?: number; sort?: string }): Promise<{trips: Trip[], total: number, totalPages: number, currentPage: number}> {
    try {
      console.log('getTripsByOwner called with:', { ownerId, filters });
      
      // First get all buses owned by this owner
      const ownerBuses = await BusService.getBusesByOwner(ownerId);
      console.log('Owner buses received:', ownerBuses);
      
      if (!ownerBuses || ownerBuses.length === 0) {
        console.log('No buses found for owner');
        return {
          trips: [],
          total: 0,
          totalPages: 0,
          currentPage: filters?.page || 1
        };
      }

      const busIds = ownerBuses.map(bus => bus._id).filter(id => id); // Filter out undefined/null IDs
      console.log('Bus IDs for filtering:', busIds);
      
      if (busIds.length === 0) {
        console.log('No valid bus IDs found');
        return {
          trips: [],
          total: 0,
          totalPages: 0,
          currentPage: filters?.page || 1
        };
      }

      // Build query parameters
      const params: any = {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        sort: filters?.sort || '-startTime'
      };
      
      if (filters?.date) {
        params.startDate = filters.date;
        params.endDate = filters.date;
      }

      let allTrips: Trip[] = [];
      let totalTrips = 0;

      // If specific busId is provided and it belongs to the owner, use it
      if (filters?.busId && busIds.includes(filters.busId)) {
        console.log('Using specific bus filter:', filters.busId);
        params.busId = filters.busId;
        try {
          const response = await api.get('/trips', { params });
          console.log('Trips API response for specific bus:', response.data);
          allTrips = response.data.data || [];
          totalTrips = response.data.total || 0;
        } catch (apiError) {
          console.error('API error for specific bus:', apiError);
          throw apiError;
        }
      } else {
        console.log('Fetching all trips and filtering by owner buses');
        // Since backend doesn't support multiple busIds, get all trips and filter
        const allTripsParams = { ...params };
        delete allTripsParams.busId; // Remove busId to get all trips
        
        try {
          const response = await api.get('/trips', { params: allTripsParams });
          console.log('All trips API response:', response.data);
          const allTripsData = response.data.data || [];
          
          // Filter trips to only include owner's buses with better error handling
          allTrips = allTripsData.filter((trip: Trip) => {
            if (!trip) {
              console.warn('Null trip found in response');
              return false;
            }
            
            if (!trip.busId) {
              console.warn('Trip without busId:', trip);
              return false;
            }
            
            // Handle both populated and non-populated busId
            let tripBusId: string;
            if (typeof trip.busId === 'object' && trip.busId !== null) {
              if ('_id' in trip.busId) {
                tripBusId = trip.busId._id;
              } else {
                console.warn('Trip busId object without _id:', trip.busId);
                return false;
              }
            } else {
              tripBusId = trip.busId as string;
            }
            
            const isOwnerTrip = tripBusId && busIds.includes(tripBusId);
            console.log(`Trip ${trip._id} bus ${tripBusId} is owner trip:`, isOwnerTrip);
            return isOwnerTrip;
          });
          
          console.log('Filtered trips:', allTrips.length, 'out of', allTripsData.length);
          totalTrips = allTrips.length;
          
          // Apply manual pagination since we filtered after fetching
          const pageSize = filters?.limit || 20;
          const currentPage = filters?.page || 1;
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          allTrips = allTrips.slice(startIndex, endIndex);
        } catch (apiError) {
          console.error('API error for all trips:', apiError);
          throw apiError;
        }
      }
      
      const result = {
        trips: allTrips,
        total: totalTrips,
        totalPages: Math.ceil(totalTrips / (filters?.limit || 20)),
        currentPage: filters?.page || 1
      };
      
      console.log('Final result:', result);
      return result;
    } catch (error: any) {
      console.error('Error in getTripsByOwner:', error);
      // Check if it's a network error or API error
      if (error.response) {
        throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch trips');
      }
    }
  }
}; 