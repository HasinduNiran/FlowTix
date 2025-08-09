import api from './api';
import { BusService } from './bus.service';

export interface Stop {
  stopId: string;
  stopName: string;
  sectionNumber: number;
}

export interface Passenger {
  fareType: 'full' | 'half' | 'quarter';
  quantity: number;
  farePerUnit: number;
  subtotal: number;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  routeId: string | { _id: string; routeName: string; routeNumber: string };
  busId: string | { _id: string; busNumber: string; busName: string };
  conductorId: string | { _id: string; username: string; fullName: string };
  dateTime: string;
  paymentMethod: 'cash' | 'card' | 'online';
  fromStop: Stop;
  toStop: Stop;
  passengers: Passenger[];
  totalPassengers: number;
  farePaid: number;
  paidAmount: number;
  balance: number;
  tripNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPaginationResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasResults?: boolean;
  searchTerm?: string;
}

export const TicketService = {
  async getAllTickets(filters?: { routeId?: string; busId?: string; conductorId?: string }): Promise<Ticket[]> {
    try {
      const response = await api.get('/tickets', { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  },

  async getTicketsWithPagination(
    page: number = 1, 
    limit: number = 15, 
    search: string = '',
    filters?: { 
      routeId?: string; 
      busId?: string; 
      conductorId?: string; 
      startDate?: string; 
      endDate?: string;
      paymentMethod?: string;
      tripNumber?: number;
    }
  ): Promise<TicketPaginationResponse> {
    try {
      // Always reset to page 1 when search changes
      if (search && page > 1) {
        page = 1;
      }

      const params: any = {
        page,
        limit,
        ...(filters || {})
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      console.log('Fetching tickets with params:', params);
      const response = await api.get('/tickets', { params });
      
      return {
        tickets: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || page,
        limit: response.data.limit || limit,
        totalPages: response.data.totalPages || 0,
        hasResults: response.data.hasResults,
        searchTerm: response.data.searchTerm
      };
    } catch (error) {
      console.error('Error fetching tickets with pagination:', error);
      throw error;
    }
  },
  
  async getTicketById(id: string): Promise<Ticket> {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ticket with id ${id}:`, error);
      throw error;
    }
  },
  
  async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },

  async deleteTicket(id: string): Promise<void> {
    try {
      await api.delete(`/tickets/${id}`);
    } catch (error) {
      console.error(`Error deleting ticket with id ${id}:`, error);
      throw error;
    }
  },

  async getTicketsForTrip(tripId: string): Promise<Ticket[]> {
    try {
      const response = await api.get(`/tickets/trip/${tripId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching tickets for trip ${tripId}:`, error);
      throw error;
    }
  },

  async getNextTicketId(): Promise<string> {
    try {
      const response = await api.get('/tickets/next-id');
      return response.data.data.nextTicketId;
    } catch (error) {
      console.error('Error getting next ticket ID:', error);
      throw error;
    }
  },

  async getTicketsByOwner(ownerId: string, filters?: { 
    date?: string; 
    busId?: string; 
    fromStopId?: string; 
    toStopId?: string; 
    paymentMethod?: string; 
    tripNumber?: string; 
    page?: number; 
    limit?: number; 
    sort?: string 
  }): Promise<{tickets: Ticket[], total: number, totalPages: number, currentPage: number}> {
    try {
      console.log('getTicketsByOwner called with:', { ownerId, filters });
      
      // First get all buses owned by this owner
      const ownerBuses = await BusService.getBusesByOwner(ownerId);
      console.log('Owner buses received:', ownerBuses);
      
      if (!ownerBuses || ownerBuses.length === 0) {
        console.log('No buses found for owner');
        return {
          tickets: [],
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
          tickets: [],
          total: 0,
          totalPages: 0,
          currentPage: filters?.page || 1
        };
      }

      // Build query parameters
      const params: any = {
        page: filters?.page || 1,
        limit: filters?.limit || 20,
        sort: filters?.sort || '-createdAt'
      };
      
      if (filters?.date) {
        params.startDate = filters.date;
        params.endDate = filters.date;
      }
      
      if (filters?.paymentMethod) {
        params.paymentMethod = filters.paymentMethod;
      }
      
      if (filters?.tripNumber) {
        params.tripNumber = filters.tripNumber;
      }
      
      // Add from and to stop filters to the API query parameters
      if (filters?.fromStopId) {
        params.fromStopId = filters.fromStopId;
      }
      
      if (filters?.toStopId) {
        params.toStopId = filters.toStopId;
      }

      let allTickets: Ticket[] = [];
      let totalTickets = 0;

      // If specific busId is provided and it belongs to the owner, use it
      if (filters?.busId && busIds.includes(filters.busId)) {
        console.log('Using specific bus filter:', filters.busId);
        params.busId = filters.busId;
        try {
          const response = await api.get('/tickets', { params });
          console.log('Tickets API response for specific bus:', response.data);
          allTickets = response.data.data || [];
          totalTickets = response.data.total || 0;
        } catch (apiError) {
          console.error('API error for specific bus:', apiError);
          throw apiError;
        }
      } else {
        console.log('Fetching all tickets and filtering by owner buses');
        // Get all tickets and filter by owner's buses
        const allTicketsParams = { ...params };
        delete allTicketsParams.busId;
        
        try {
          const response = await api.get('/tickets', { params: allTicketsParams });
          console.log('All tickets API response:', response.data);
          const allTicketsData = response.data.data || [];
          
          // Filter tickets to only include owner's buses
          allTickets = allTicketsData.filter((ticket: Ticket) => {
            if (!ticket) {
              console.warn('Null ticket found in response');
              return false;
            }
            
            if (!ticket.busId) {
              console.warn('Ticket without busId:', ticket);
              return false;
            }
            
            // Handle both populated and non-populated busId
            let ticketBusId: string;
            if (typeof ticket.busId === 'object' && ticket.busId !== null) {
              if ('_id' in ticket.busId) {
                ticketBusId = (ticket.busId as any)._id;
              } else {
                console.warn('Ticket busId object without _id:', ticket.busId);
                return false;
              }
            } else {
              ticketBusId = ticket.busId as string;
            }
            
            const isOwnerTicket = ticketBusId && busIds.includes(ticketBusId);
            console.log(`Ticket ${ticket._id} bus ${ticketBusId} is owner ticket:`, isOwnerTicket);
            return isOwnerTicket;
          });
          
          console.log('Filtered tickets:', allTickets.length, 'out of', allTicketsData.length);
          totalTickets = allTickets.length;
          
          // Apply manual pagination since we filtered after fetching
          const pageSize = filters?.limit || 20;
          const currentPage = filters?.page || 1;
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          allTickets = allTickets.slice(startIndex, endIndex);
        } catch (apiError) {
          console.error('API error for all tickets:', apiError);
          throw apiError;
        }
      }
      
      const result = {
        tickets: allTickets,
        total: totalTickets,
        totalPages: Math.ceil(totalTickets / (filters?.limit || 20)),
        currentPage: filters?.page || 1
      };
      
      console.log('Final tickets result:', result);
      return result;
    } catch (error: any) {
      console.error('Error in getTicketsByOwner:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `API Error: ${error.response.status}`);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to fetch tickets');
      }
    }
  }
}; 