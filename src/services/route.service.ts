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
      return response.data.data;
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  },
  
  async getRouteById(id: string): Promise<Route> {
    try {
      const response = await api.get(`/routes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching route with id ${id}:`, error);
      throw error;
    }
  },
  
  async createRoute(routeData: Omit<Route, '_id' | 'createdAt' | 'updatedAt'>): Promise<Route> {
    try {
      const response = await api.post('/routes', routeData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  },
  
  async updateRoute(id: string, routeData: Partial<Omit<Route, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Route> {
    try {
      const response = await api.put(`/routes/${id}`, routeData);
      return response.data.data;
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
  }
}; 