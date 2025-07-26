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
  // Get manager's assigned bus (for backward compatibility)
  async getAssignedBus(): Promise<ManagerBus> {
    try {
      const response = await api.get('/auth/manager/bus');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assigned bus:', error);
      throw error;
    }
  },

  // Get all assigned buses for the manager
  async getAssignedBuses(): Promise<ManagerBus[]> {
    try {
      const response = await api.get('/auth/manager/buses');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching assigned buses:', error);
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

  // Get route for manager's assigned bus
  async getRoute(): Promise<{
    _id: string;
    routeName: string;
    routeNumber: string;
    startLocation?: string;
    endLocation?: string;
  }> {
    try {
      const response = await api.get('/auth/manager/routes');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching route:', error);
      throw error;
    }
  },

  // Get all routes (for route selector)
  async getRoutes(): Promise<Array<{
    _id: string;
    routeName: string;
    routeNumber: string;
    startLocation?: string;
    endLocation?: string;
  }>> {
    try {
      // First try to get the manager's assigned route
      const assignedRoute = await this.getRoute();
      return [assignedRoute];
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },

  // Get routes for manager's assigned buses (multiple buses support)
  async getRoutesByManager(): Promise<Array<{
    _id: string;
    name: string;
    code: string;
    routeName: string;
    routeNumber: string;
    startLocation?: string;
    endLocation?: string;
  }>> {
    try {
      // Get all assigned buses for the manager
      const busesResponse = await api.get('/auth/manager/buses');
      const buses = busesResponse.data.data || [];
      
      if (!buses || buses.length === 0) {
        return [];
      }
      
      // Extract unique routes from all assigned buses
      const routesMap = new Map();
      
      buses.forEach((bus: any) => {
        if (bus.routeId) {
          const route = {
            _id: bus.routeId._id,
            name: bus.routeId.routeName || bus.routeId.name,
            code: bus.routeId.routeNumber || bus.routeId.code,
            routeName: bus.routeId.routeName,
            routeNumber: bus.routeId.routeNumber,
            startLocation: bus.routeId.startLocation || bus.routeId.startPoint,
            endLocation: bus.routeId.endLocation || bus.routeId.endPoint
          };
          routesMap.set(route._id, route);
        }
      });
      
      return Array.from(routesMap.values());
    } catch (error) {
      console.error('Error fetching routes by manager:', error);
      throw error;
    }
  },

  // Get route sections for a specific route ID
  async getRouteSectionsByRouteId(routeId: string): Promise<Array<{
    _id: string;
    routeId: {
      _id: string;
      routeName: string;
      routeNumber: string;
      startPoint: string;
      endPoint: string;
      distance: number;
      estimatedDuration: number;
      isActive: boolean;
    };
    stopId: {
      _id: string;
      stopCode: string;
      stopName: string;
      sectionNumber: number;
      isActive: boolean;
    };
    category: string;
    fare: number;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      // Use the dedicated route sections API to get sections for specific route
      const response = await api.get(`/route-sections/route/${routeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching route sections for route ${routeId}:`, error);
      throw error;
    }
  },

  // Get route sections for manager's assigned buses (multiple buses support)
  async getRouteSectionsByManager(): Promise<Array<{
    _id: string;
    routeId: {
      _id: string;
      routeName: string;
      routeNumber: string;
      startPoint: string;
      endPoint: string;
      distance: number;
      estimatedDuration: number;
      isActive: boolean;
    };
    stopId: {
      _id: string;
      stopCode: string;
      stopName: string;
      sectionNumber: number;
      isActive: boolean;
    };
    category: string;
    fare: number;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>> {
    try {
      // Get all assigned buses for the manager
      const busesResponse = await api.get('/auth/manager/buses');
      const buses = busesResponse.data.data || [];
      
      if (!buses || buses.length === 0) {
        return [];
      }
      
      // Get unique route IDs from all assigned buses
      const routeIds = [...new Set(buses.map((bus: any) => bus.routeId?._id).filter(Boolean))];
      
      // Fetch route sections for all routes
      const allRouteSections: any[] = [];
      
      for (const routeId of routeIds) {
        try {
          const response = await api.get(`/route-sections/route/${routeId}`);
          const sections = response.data.data || [];
          allRouteSections.push(...sections);
        } catch (error) {
          console.error(`Error fetching sections for route ${routeId}:`, error);
          // Continue with other routes even if one fails
        }
      }
      
      return allRouteSections;
    } catch (error) {
      console.error('Error fetching route sections by manager:', error);
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
