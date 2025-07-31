import api from './api';

export interface MonthlyFee {
  _id: string;
  busId: {
    _id: string;
    busNumber: string;
    busName: string;
  };
  ownerId: {
    _id: string;
    username: string;
  };
  month: string;
  amount: number;
  paidAmount: number;
  status: 'paid' | 'unpaid' | 'partial';
  paymentDate: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyFeeRequest {
  busId: string;
  ownerId: string;
  month: string;
  amount: number;
  paidAmount?: number;
  status?: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
  notes?: string;
}

export interface UpdateMonthlyFeeRequest {
  amount?: number;
  paidAmount?: number;
  status?: 'paid' | 'unpaid' | 'partial';
  paymentDate?: string;
  notes?: string;
}

export interface MonthlyFeeFilters {
  busId?: string;
  ownerId?: string;
  month?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const MonthlyFeeService = {
  async getAllMonthlyFees(filters: MonthlyFeeFilters = {}): Promise<{
    data: MonthlyFee[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await api.get(`/monthly-fees?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly fees:', error);
      throw error;
    }
  },

  async getMonthlyFeeById(id: string): Promise<MonthlyFee> {
    try {
      const response = await api.get(`/monthly-fees/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching monthly fee:', error);
      throw error;
    }
  },

  async createMonthlyFee(data: CreateMonthlyFeeRequest): Promise<MonthlyFee> {
    try {
      const response = await api.post('/monthly-fees', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating monthly fee:', error);
      throw error;
    }
  },

  async updateMonthlyFee(id: string, data: UpdateMonthlyFeeRequest): Promise<MonthlyFee> {
    try {
      const response = await api.put(`/monthly-fees/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating monthly fee:', error);
      throw error;
    }
  },

  async deleteMonthlyFee(id: string): Promise<void> {
    try {
      await api.delete(`/monthly-fees/${id}`);
    } catch (error) {
      console.error('Error deleting monthly fee:', error);
      throw error;
    }
  },

  async markAsPaid(id: string, paidAmount: number, paymentDate?: string): Promise<MonthlyFee> {
    try {
      const response = await api.patch(`/monthly-fees/${id}/mark-paid`, {
        paidAmount,
        paymentDate: paymentDate || new Date().toISOString()
      });
      return response.data.data;
    } catch (error) {
      console.error('Error marking monthly fee as paid:', error);
      throw error;
    }
  },

  async generateBill(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/monthly-fees/${id}/bill`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating bill:', error);
      throw error;
    }
  },

  async getMonthlyFeesByOwner(ownerId: string, filters: Omit<MonthlyFeeFilters, 'ownerId'> = {}): Promise<{
    data: MonthlyFee[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('ownerId', ownerId);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      console.log('Fetching monthly fees for owner:', ownerId, 'with filters:', filters);
      const response = await api.get(`/monthly-fees?${params.toString()}`);
      console.log('Monthly fees response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly fees for owner:', error);
      throw error;
    }
  },

  async downloadBill(monthlyFeeId: string, busNumber: string, month: string): Promise<void> {
    try {
      const response = await api.get(`/monthly-fees/${monthlyFeeId}/bill`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `MonthlyFee_${busNumber}_${month}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading bill:', error);
      throw error;
    }
  }
};
