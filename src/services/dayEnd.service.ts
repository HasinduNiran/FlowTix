import api from './api';

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
  }
};
