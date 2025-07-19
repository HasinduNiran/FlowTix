import api from './api';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  trip: string;
  fromStop: string;
  toStop: string;
  passengerName?: string;
  passengerContact?: string;
  fare: number;
  status: 'booked' | 'cancelled' | 'completed';
  seatNumber?: string;
  issuedBy: string;
  issuedAt: Date;
  createdAt: string;
  updatedAt: string;
}

export const TicketService = {
  async getAllTickets(filters?: { tripId?: string; status?: string }): Promise<Ticket[]> {
    try {
      const response = await api.get('/tickets', { params: filters });
      return response.data.data;
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
  
  async createTicket(ticketData: Omit<Ticket, '_id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  },
  
  async updateTicket(id: string, ticketData: Partial<Omit<Ticket, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Ticket> {
    try {
      const response = await api.put(`/tickets/${id}`, ticketData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating ticket with id ${id}:`, error);
      throw error;
    }
  },
  
  async cancelTicket(id: string): Promise<Ticket> {
    try {
      const response = await api.patch(`/tickets/${id}/cancel`);
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling ticket with id ${id}:`, error);
      throw error;
    }
  },
  
  async verifyTicket(ticketNumber: string): Promise<Ticket> {
    try {
      const response = await api.get(`/tickets/verify/${ticketNumber}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error verifying ticket number ${ticketNumber}:`, error);
      throw error;
    }
  }
}; 