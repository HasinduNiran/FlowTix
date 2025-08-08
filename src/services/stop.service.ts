import api from './api';

export interface Stop {
  _id: string;
  stopCode: string;
  stopName: string;
  sectionNumber: number;
  routeId: string | {
    _id: string;
    routeName: string;
    routeNumber: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStopData {
  stopCode: string;
  stopName: string;
  sectionNumber: number;
  routeId: string;
  isActive?: boolean;
}

export interface UpdateStopData extends Partial<CreateStopData> {}

export interface StopsResponse {
  data: Stop[];
  count: number;
  totalPages: number;
  currentPage: number;
}

export const StopService = {
  // Get all stops
  async getAllStops(limit: number = 100): Promise<Stop[]> {
    try {
      const response = await api.get(`/stops?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching stops:', error);
      throw error;
    }
  },
  
  // Get stops with pagination and filtering
  async getStopsWithPagination(options: {
    page?: number;
    limit?: number;
    search?: string;
    routeId?: string;
    isActive?: boolean | string;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<StopsResponse> {
    try {
      const { page = 1, limit = 15, search, routeId, isActive, sort, order } = options;
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      if (routeId && routeId !== 'all') params.append('routeId', routeId);
      if (isActive !== undefined && isActive !== 'all') {
        params.append('isActive', isActive === 'active' ? 'true' : 'false');
      }
      if (sort) params.append('sort', sort);
      if (order) params.append('order', order);
      
      const response = await api.get(`/stops?${params.toString()}`);
      
      return {
        data: response.data.data || [],
        count: response.data.count || 0,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.currentPage || 1
      };
    } catch (error) {
      console.error('Error fetching stops with pagination:', error);
      throw error;
    }
  },

  // Get stops by route ID
  async getStopsByRoute(routeId: string): Promise<Stop[]> {
    try {
      const response = await api.get(`/stops/route/${routeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching stops by route:', error);
      throw error;
    }
  },

  // Get stop by ID
  async getStopById(id: string): Promise<Stop> {
    try {
      const response = await api.get(`/stops/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching stop:', error);
      throw error;
    }
  },

  // Get stop by code
  async getStopByCode(stopCode: string): Promise<Stop> {
    try {
      const response = await api.get(`/stops/code/${stopCode}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching stop by code:', error);
      throw error;
    }
  },

  // Create stop
  async createStop(data: CreateStopData): Promise<Stop> {
    try {
      const response = await api.post('/stops', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating stop:', error);
      throw error;
    }
  },

  // Update stop
  async updateStop(id: string, data: UpdateStopData): Promise<Stop> {
    try {
      const response = await api.put(`/stops/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating stop:', error);
      throw error;
    }
  },

  // Delete stop
  async deleteStop(id: string): Promise<void> {
    try {
      await api.delete(`/stops/${id}`);
    } catch (error) {
      console.error('Error deleting stop:', error);
      throw error;
    }
  }
};

export default StopService;
