import api from './api';
import { BusService } from './bus.service';

export interface DayEndTripDetail {
  tripId: string;
  tripNumber: number;
  startTime: Date | string;
  endTime: Date | string;
  totalFare: number;
  passengerCount: number;
  cashInHand: number;
}

export interface DayEndExpense {
  expenseTypeId: string;
  expenseName: string;
  amount: number;
}

export interface DayEnd {
  _id: string;
  busId: string | any; // Can be populated
  date: Date | string;
  tripDetails: DayEndTripDetail[];
  expenses: DayEndExpense[];
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  conductorId: string | {
    _id: string;
    username: string;
    role: string;
  }; // Can be populated with username and role
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CreateDayEndData {
  busId: string;
  date: string;
  tripDetails: DayEndTripDetail[];
  expenses: DayEndExpense[];
  conductorId: string;
  notes?: string;
}

export const DayEndService = {
  async getAllDayEnds(filters?: { 
    busId?: string; 
    conductorId?: string; 
    date?: string; 
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number; 
    limit?: number; 
    sort?: string 
  }): Promise<DayEnd[]> {
    try {
      const response = await api.get('/day-end', { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching day end records:', error);
      throw error;
    }
  },

  async getDayEndById(id: string): Promise<DayEnd> {
    try {
      const response = await api.get(`/day-end/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching day end record with id ${id}:`, error);
      throw error;
    }
  },

  async createDayEnd(dayEndData: CreateDayEndData): Promise<DayEnd> {
    try {
      const response = await api.post('/day-end', dayEndData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating day end record:', error);
      throw error;
    }
  },

  async updateDayEnd(id: string, dayEndData: Partial<CreateDayEndData>): Promise<DayEnd> {
    try {
      const response = await api.put(`/day-end/${id}`, dayEndData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating day end record with id ${id}:`, error);
      throw error;
    }
  },

  async updateDayEndStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<DayEnd> {
    try {
      const response = await api.patch(`/day-end/${id}/status`, { status, notes });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating day end status for id ${id}:`, error);
      throw error;
    }
  },

  async deleteDayEnd(id: string): Promise<void> {
    try {
      await api.delete(`/day-end/${id}`);
    } catch (error) {
      console.error(`Error deleting day end record with id ${id}:`, error);
      throw error;
    }
  },

  async getDayEndSummary(filters?: { 
    busId?: string; 
    startDate?: string; 
    endDate?: string 
  }): Promise<any> {
    try {
      const response = await api.get('/day-end/summary', { params: filters });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching day end summary:', error);
      throw error;
    }
  },

  async getDayEndsByOwner(ownerId: string, filters?: { 
    startDate?: string; 
    endDate?: string; 
    busId?: string; 
    status?: string;
    page?: number; 
    limit?: number; 
    sort?: string 
  }): Promise<{dayEnds: DayEnd[], total: number, totalPages: number, currentPage: number}> {
    try {
      console.log('getDayEndsByOwner called with:', { ownerId, filters });
      
      // First get all buses owned by this owner
      const ownerBuses = await BusService.getBusesByOwner(ownerId);
      console.log('Owner buses received:', ownerBuses);
      
      if (!ownerBuses || ownerBuses.length === 0) {
        console.log('No buses found for owner');
        return {
          dayEnds: [],
          total: 0,
          totalPages: 0,
          currentPage: filters?.page || 1
        };
      }

      const busIds = ownerBuses.map(bus => bus._id).filter(id => id);
      console.log('Bus IDs for filtering:', busIds);
      
      if (busIds.length === 0) {
        console.log('No valid bus IDs found');
        return {
          dayEnds: [],
          total: 0,
          totalPages: 0,
          currentPage: filters?.page || 1
        };
      }

      // Build query parameters
      const params: any = {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        sort: filters?.sort || '-date'
      };
      
      if (filters?.startDate) {
        params.startDate = filters.startDate;
      }
      
      if (filters?.endDate) {
        params.endDate = filters.endDate;
      }
      
      if (filters?.status) {
        params.status = filters.status;
      }

      let allDayEnds: DayEnd[] = [];
      let totalDayEnds = 0;

      // If specific busId is provided and it belongs to the owner, use it
      if (filters?.busId && busIds.includes(filters.busId)) {
        console.log('Using specific bus filter:', filters.busId);
        params.busId = filters.busId;
        try {
          const response = await api.get('/day-end', { params });
          console.log('DayEnd API response for specific bus:', response.data);
          allDayEnds = response.data.data || [];
          totalDayEnds = response.data.total || allDayEnds.length;
        } catch (apiError) {
          console.error('API error for specific bus:', apiError);
          throw apiError;
        }
      } else {
        console.log('Fetching all day ends and filtering by owner buses');
        // Get all day ends and filter by owner's buses
        const allDayEndsParams = { ...params };
        delete allDayEndsParams.busId;
        
        try {
          const response = await api.get('/day-end', { params: allDayEndsParams });
          console.log('All day ends API response:', response.data);
          const allDayEndsData = response.data.data || [];
          
          // Filter day ends to only include owner's buses
          allDayEnds = allDayEndsData.filter((dayEnd: DayEnd) => {
            if (!dayEnd) {
              console.warn('Null day end found in response');
              return false;
            }
            
            if (!dayEnd.busId) {
              console.warn('Day end without busId:', dayEnd);
              return false;
            }
            
            // Handle both populated and non-populated busId
            let dayEndBusId: string;
            if (typeof dayEnd.busId === 'object' && dayEnd.busId !== null) {
              if ('_id' in dayEnd.busId) {
                dayEndBusId = (dayEnd.busId as any)._id;
              } else {
                console.warn('Day end busId object without _id:', dayEnd.busId);
                return false;
              }
            } else {
              dayEndBusId = dayEnd.busId as string;
            }
            
            const isOwnerDayEnd = dayEndBusId && busIds.includes(dayEndBusId);
            console.log(`Day end ${dayEnd._id} bus ${dayEndBusId} is owner day end:`, isOwnerDayEnd);
            return isOwnerDayEnd;
          });
          
          console.log('Filtered day ends:', allDayEnds.length, 'out of', allDayEndsData.length);
          totalDayEnds = allDayEnds.length;
          
          // Apply manual pagination since we filtered after fetching
          const pageSize = filters?.limit || 20;
          const currentPage = filters?.page || 1;
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          allDayEnds = allDayEnds.slice(startIndex, endIndex);
        } catch (apiError) {
          console.error('API error for all day ends:', apiError);
          throw apiError;
        }
      }
      
      const result = {
        dayEnds: allDayEnds,
        total: totalDayEnds,
        totalPages: Math.ceil(totalDayEnds / (filters?.limit || 20)),
        currentPage: filters?.page || 1
      };
      
      console.log('Final day ends result:', result);
      return result;
    } catch (error: any) {
      console.error('Error in getDayEndsByOwner:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch day end records');
      }
    }
  }
};
