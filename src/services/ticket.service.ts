import api from './api';

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
  routeId: string;
  busId: string;
  conductorId: string;
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
  }
}; 