import api from './api';

export interface RouteSection {
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
}

export interface CreateRouteSectionData {
  routeId: string;
  stopId: string;
  category: string;
  fare: number;
  order: number;
  isActive?: boolean;
}

export interface UpdateRouteSectionData extends Partial<CreateRouteSectionData> {}

export const RouteSectionService = {
  // Get all route sections
  async getAllRouteSections(): Promise<RouteSection[]> {
    try {
      const response = await api.get('/route-sections');
      // Backend returns paginated data in response.data.data
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching route sections:', error);
      throw error;
    }
  },

  // Get route sections by route ID
  async getRouteSectionsByRoute(routeId: string): Promise<RouteSection[]> {
    try {
      const response = await api.get(`/route-sections/route/${routeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching route sections by route:', error);
      throw error;
    }
  },

  // Get route section by ID
  async getRouteSectionById(id: string): Promise<RouteSection> {
    try {
      const response = await api.get(`/route-sections/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching route section:', error);
      throw error;
    }
  },

  // Create route section
  async createRouteSection(data: CreateRouteSectionData): Promise<RouteSection> {
    try {
      const response = await api.post('/route-sections', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating route section:', error);
      throw error;
    }
  },

  // Update route section
  async updateRouteSection(id: string, data: UpdateRouteSectionData): Promise<RouteSection> {
    try {
      const response = await api.put(`/route-sections/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating route section:', error);
      throw error;
    }
  },

  // Delete route section
  async deleteRouteSection(id: string): Promise<void> {
    try {
      await api.delete(`/route-sections/${id}`);
    } catch (error) {
      console.error('Error deleting route section:', error);
      throw error;
    }
  },

  // Bulk update route sections order
  async updateRouteSectionsOrder(routeId: string, sections: { id: string; order: number }[]): Promise<void> {
    try {
      await api.put(`/route-sections/route/${routeId}/order`, { sections });
    } catch (error) {
      console.error('Error updating route sections order:', error);
      throw error;
    }
  },

  // Get fare between two stops
  async getFareBetweenStops(routeId: string, fromStopId: string, toStopId: string, category?: string): Promise<number> {
    try {
      const response = await api.get(`/route-sections/fare`, {
        params: { routeId, fromStopId, toStopId, category }
      });
      return response.data.fare;
    } catch (error) {
      console.error('Error calculating fare:', error);
      throw error;
    }
  },

  // Get route sections for owner's routes only
  async getRouteSectionsByOwner(ownerId: string): Promise<RouteSection[]> {
    try {
      // First get buses owned by this owner to get route IDs
      const busResponse = await api.get(`/buses/owner/${ownerId}`);
      const buses = busResponse.data.data;
      
      if (!buses || buses.length === 0) {
        return [];
      }
      
      // Extract unique route IDs from the buses
      const routeIds = [...new Set(buses.map((bus: any) => bus.routeId?._id || bus.routeId).filter(Boolean))];
      
      if (routeIds.length === 0) {
        return [];
      }
      
      // Get route sections for each route owned by this owner
      const allRouteSections = await Promise.all(
        routeIds.map(async (routeId) => {
          try {
            const response = await api.get(`/route-sections/route/${routeId}`);
            return response.data.data || [];
          } catch (error) {
            console.error(`Error fetching route sections for route ${routeId}:`, error);
            return [];
          }
        })
      );
      
      // Flatten the array of route sections
      return allRouteSections.flat();
    } catch (error) {
      console.error('Error fetching route sections by owner:', error);
      throw error;
    }
  }
};

export default RouteSectionService;
