import api from './api';

export interface Route {
  _id: string;
  name: string;
  code: string;
  description?: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Backend uses these field names
  routeName?: string;
  routeNumber?: string;
  startPoint?: string;
  endPoint?: string;
}

export interface Section {
  _id: string;
  name: string;
  code: string;
  description?: string;
  distance: number;
  fare: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RouteSection {
  _id: string;
  route: string;
  section: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const RouteService = {
  // Routes
  async getAllRoutes(): Promise<Route[]> {
    try {
      const response = await api.get('/routes');
      // Map backend field names to frontend field names
      return response.data.data.map((route: any) => ({
        _id: route._id,
        name: route.routeName,
        code: route.routeNumber,
        startLocation: route.startPoint,
        endLocation: route.endPoint,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
        description: route.description,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },
  
  async getRouteById(id: string): Promise<Route> {
    try {
      const response = await api.get(`/routes/${id}`);
      const route = response.data.data;
      // Map backend field names to frontend field names
      return {
        _id: route._id,
        name: route.routeName,
        code: route.routeNumber,
        startLocation: route.startPoint,
        endLocation: route.endPoint,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
        description: route.description,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      };
    } catch (error) {
      console.error(`Error fetching route with id ${id}:`, error);
      throw error;
    }
  },
  
  async createRoute(routeData: Omit<Route, '_id' | 'createdAt' | 'updatedAt'>): Promise<Route> {
    try {
      // Map frontend field names to backend field names
      const backendRouteData = {
        routeName: routeData.name,
        routeNumber: routeData.code,
        startPoint: routeData.startLocation,
        endPoint: routeData.endLocation,
        distance: routeData.distance,
        estimatedDuration: routeData.estimatedDuration,
        isActive: routeData.isActive,
        description: routeData.description
      };
      
      const response = await api.post('/routes', backendRouteData);
      const route = response.data.data;
      
      // Return with frontend field names
      return {
        _id: route._id,
        name: route.routeName,
        code: route.routeNumber,
        startLocation: route.startPoint,
        endLocation: route.endPoint,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
        description: route.description,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      };
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  },
  
  async updateRoute(id: string, routeData: Partial<Omit<Route, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Route> {
    try {
      // Map frontend field names to backend field names
      const backendRouteData: any = {};
      
      if (routeData.name !== undefined) backendRouteData.routeName = routeData.name;
      if (routeData.code !== undefined) backendRouteData.routeNumber = routeData.code;
      if (routeData.startLocation !== undefined) backendRouteData.startPoint = routeData.startLocation;
      if (routeData.endLocation !== undefined) backendRouteData.endPoint = routeData.endLocation;
      if (routeData.distance !== undefined) backendRouteData.distance = routeData.distance;
      if (routeData.estimatedDuration !== undefined) backendRouteData.estimatedDuration = routeData.estimatedDuration;
      if (routeData.isActive !== undefined) backendRouteData.isActive = routeData.isActive;
      if (routeData.description !== undefined) backendRouteData.description = routeData.description;
      
      const response = await api.put(`/routes/${id}`, backendRouteData);
      const route = response.data.data;
      
      // Return with frontend field names
      return {
        _id: route._id,
        name: route.routeName,
        code: route.routeNumber,
        startLocation: route.startPoint,
        endLocation: route.endPoint,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
        description: route.description,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      };
    } catch (error) {
      console.error(`Error updating route with id ${id}:`, error);
      throw error;
    }
  },
  
  async deleteRoute(id: string): Promise<void> {
    try {
      await api.delete(`/routes/${id}`);
    } catch (error) {
      console.error(`Error deleting route with id ${id}:`, error);
      throw error;
    }
  },
  
  // Sections
  async getAllSections(): Promise<Section[]> {
    try {
      const response = await api.get('/sections');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  },
  
  async getSectionById(id: string): Promise<Section> {
    try {
      const response = await api.get(`/sections/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching section with id ${id}:`, error);
      throw error;
    }
  },
  
  async createSection(sectionData: Omit<Section, '_id' | 'createdAt' | 'updatedAt'>): Promise<Section> {
    try {
      const response = await api.post('/sections', sectionData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  },
  
  // Route Sections
  async getRouteSections(routeId: string): Promise<RouteSection[]> {
    try {
      const response = await api.get(`/route-sections?route=${routeId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching route sections for route ${routeId}:`, error);
      throw error;
    }
  },
  
  async addSectionToRoute(routeId: string, sectionId: string, order: number): Promise<RouteSection> {
    try {
      const response = await api.post('/route-sections', {
        route: routeId,
        section: sectionId,
        order
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error adding section ${sectionId} to route ${routeId}:`, error);
      throw error;
    }
  },

  async searchRoutesByNumber(searchTerm: string = ''): Promise<Route[]> {
    try {
      // Get all routes first, then filter by routeNumber
      const response = await api.get('/routes?limit=50&isActive=true');
      const routes = response.data.data.map((route: any) => ({
        _id: route._id,
        name: route.routeName,
        code: route.routeNumber,
        startLocation: route.startPoint,
        endLocation: route.endPoint,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
        description: route.description,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      }));
      
      if (!searchTerm.trim()) {
        return routes;
      }
      
      // Filter routes by route number containing the search term
      return routes.filter((route: Route) => 
        route.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limit to 10 results
    } catch (error) {
      console.error('Error searching routes by number:', error);
      throw error;
    }
  },

  // Get routes by owner - filters routes based on buses owned by the user
  async getRoutesByOwner(ownerId: string): Promise<Route[]> {
    try {
      // First get buses owned by this owner
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
      
      // Get all routes and filter by route IDs
      const response = await api.get('/routes?limit=100&isActive=true');
      const allRoutes = response.data.data.map((route: any) => ({
        _id: route._id,
        name: route.routeName,
        code: route.routeNumber,
        startLocation: route.startPoint,
        endLocation: route.endPoint,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration,
        isActive: route.isActive,
        description: route.description,
        createdAt: route.createdAt,
        updatedAt: route.updatedAt
      }));
      
      // Filter routes that belong to this owner's buses
      return allRoutes.filter((route: Route) => routeIds.includes(route._id));
    } catch (error) {
      console.error('Error fetching routes by owner:', error);
      throw error;
    }
  }
}; 