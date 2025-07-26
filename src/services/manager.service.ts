import api from './api';
import { Bus } from './bus.service';

export interface ManagerBus extends Bus {
  plateNumber?: string;
  busType?: string;
  capacity?: number;
  conductorName?: string;
  routeName?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface ManagerTrip {
  _id: string;
  tripNumber: string;
  busId: string;
  routeId: string;
  routeName?: string;
  startTime: string;
  endTime?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  ticketsSold: number;
  revenue: number;
  conductorId: string;
  conductorName?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerTicket {
  _id: string;
  ticketNumber: string;
  passengerName: string;
  fromStopId: string;
  toStopId: string;
  fromStopName?: string;
  toStopName?: string;
  price: number;
  tripId: string;
  busId: string;
  routeName?: string;
  seatNumber: string;
  bookingTime: string;
  status: 'booked' | 'used' | 'cancelled' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'digital';
  createdAt: string;
  updatedAt: string;
}

export interface DayEndReport {
  _id: string;
  date: string;
  busId: string;
  conductorId: string;
  totalTrips: number;
  totalTickets: number;
  totalRevenue: number;
  cashCollected: number;
  digitalPayments: number;
  expenses: number;
  netAmount: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  submittedBy?: string;
  approvedBy?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerExpense {
  _id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: 'fuel' | 'maintenance' | 'insurance' | 'permit' | 'other';
  busId: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSection {
  _id: string;
  routeId: string;
  routeName?: string;
  fromStopId: string;
  toStopId: string;
  fromStopName?: string;
  toStopName?: string;
  distance: number;
  basePrice: number;
  estimatedTime: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyFee {
  _id: string;
  month: string;
  year: number;
  busId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  transactionId?: string;
  lateFee?: number;
  createdAt: string;
  updatedAt: string;
}

export const ManagerService = {
  // Get manager's assigned bus
  async getAssignedBus(): Promise<ManagerBus> {
    try {
      const response = await api.get('/auth/manager/bus');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assigned bus:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<{
    totalTrips: number;
    totalTickets: number;
    totalRevenue: number;
    todayTrips: number;
    todayTickets: number;
    todayRevenue: number;
    pendingReports: number;
    pendingExpenses: number;
  }> {
    try {
      const response = await api.get('/auth/manager/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activities
  async getRecentActivities(limit: number = 5): Promise<Array<{
    id: string;
    action: string;
    description: string;
    time: string;
    type: 'success' | 'warning' | 'info';
  }>> {
    try {
      const response = await api.get(`/auth/manager/dashboard/activities?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },

  // Get trips for manager's assigned bus
  async getTrips(filter?: 'all' | 'today' | 'week' | 'month'): Promise<ManagerTrip[]> {
    try {
      const params = filter ? `?filter=${filter}` : '';
      const response = await api.get(`/auth/manager/trips${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  // Get trip by ID
  async getTripById(tripId: string): Promise<ManagerTrip> {
    try {
      const response = await api.get(`/manager/trips/${tripId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching trip ${tripId}:`, error);
      throw error;
    }
  },

  // Cancel a trip
  async cancelTrip(tripId: string, reason?: string): Promise<ManagerTrip> {
    try {
      const response = await api.put(`/manager/trips/${tripId}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling trip ${tripId}:`, error);
      throw error;
    }
  },

  // Get tickets for manager's assigned bus
  async getTickets(filter?: {
    status?: 'all' | 'booked' | 'used' | 'cancelled';
    dateRange?: 'all' | 'today' | 'week' | 'month';
  }): Promise<ManagerTicket[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.status && filter.status !== 'all') {
        params.append('status', filter.status);
      }
      if (filter?.dateRange && filter.dateRange !== 'all') {
        params.append('dateRange', filter.dateRange);
      }
      
      const queryString = params.toString();
      const response = await api.get(`/auth/manager/tickets${queryString ? `?${queryString}` : ''}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  // Cancel a ticket
  async cancelTicket(ticketId: string, reason?: string): Promise<ManagerTicket> {
    try {
      const response = await api.put(`/manager/tickets/${ticketId}/cancel`, { reason });
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling ticket ${ticketId}:`, error);
      throw error;
    }
  },

  // Get day-end reports
  async getDayEndReports(period?: 'week' | 'month' | 'all'): Promise<DayEndReport[]> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await api.get(`/manager/day-end${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching day-end reports:', error);
      throw error;
    }
  },

  // Get day-end report by ID
  async getDayEndReportById(reportId: string): Promise<DayEndReport> {
    try {
      const response = await api.get(`/manager/day-end/${reportId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching day-end report ${reportId}:`, error);
      throw error;
    }
  },

  // Approve day-end report
  async approveDayEndReport(reportId: string, remarks?: string): Promise<DayEndReport> {
    try {
      const response = await api.put(`/manager/day-end/${reportId}/approve`, { remarks });
      return response.data.data;
    } catch (error) {
      console.error(`Error approving day-end report ${reportId}:`, error);
      throw error;
    }
  },

  // Reject day-end report
  async rejectDayEndReport(reportId: string, reason: string): Promise<DayEndReport> {
    try {
      const response = await api.put(`/manager/day-end/${reportId}/reject`, { reason });
      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting day-end report ${reportId}:`, error);
      throw error;
    }
  },

  // Get expenses
  async getExpenses(filter?: {
    category?: 'all' | 'fuel' | 'maintenance' | 'insurance' | 'permit' | 'other';
    status?: 'all' | 'pending' | 'approved' | 'rejected';
    dateRange?: 'all' | 'week' | 'month';
  }): Promise<ManagerExpense[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.category && filter.category !== 'all') {
        params.append('category', filter.category);
      }
      if (filter?.status && filter.status !== 'all') {
        params.append('status', filter.status);
      }
      if (filter?.dateRange && filter.dateRange !== 'all') {
        params.append('dateRange', filter.dateRange);
      }
      
      const queryString = params.toString();
      const response = await api.get(`/manager/expenses${queryString ? `?${queryString}` : ''}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Approve expense
  async approveExpense(expenseId: string, remarks?: string): Promise<ManagerExpense> {
    try {
      const response = await api.put(`/manager/expenses/${expenseId}/approve`, { remarks });
      return response.data.data;
    } catch (error) {
      console.error(`Error approving expense ${expenseId}:`, error);
      throw error;
    }
  },

  // Reject expense
  async rejectExpense(expenseId: string, reason: string): Promise<ManagerExpense> {
    try {
      const response = await api.put(`/manager/expenses/${expenseId}/reject`, { reason });
      return response.data.data;
    } catch (error) {
      console.error(`Error rejecting expense ${expenseId}:`, error);
      throw error;
    }
  },

  // Get route sections for assigned bus route
  async getRouteSections(): Promise<RouteSection[]> {
    try {
      const response = await api.get('/manager/route-sections');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching route sections:', error);
      throw error;
    }
  },

  // Get monthly fees
  async getMonthlyFees(year?: number): Promise<MonthlyFee[]> {
    try {
      const params = year ? `?year=${year}` : '';
      const response = await api.get(`/manager/monthly-fees${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly fees:', error);
      throw error;
    }
  },

  // Mark monthly fee as paid
  async markMonthlyFeeAsPaid(feeId: string, paymentData: {
    paymentMethod: string;
    transactionId?: string;
    paidDate: string;
  }): Promise<MonthlyFee> {
    try {
      const response = await api.put(`/manager/monthly-fees/${feeId}/mark-paid`, paymentData);
      return response.data.data;
    } catch (error) {
      console.error(`Error marking monthly fee ${feeId} as paid:`, error);
      throw error;
    }
  }
};
