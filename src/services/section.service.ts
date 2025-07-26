import api from './api';

export enum SectionCategory {
  NORMAL = 'normal',
  LUXURY = 'luxury',
  SEMI_LUXURY = 'semi_luxury',
  HIGH_LUXURY = 'high_luxury',
  SISU_SARIYA = 'sisu_sariya'
}

export interface Section {
  _id: string;
  sectionNumber: number;
  fare: number;
  category: SectionCategory;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SectionService = {
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

  async getSectionByNumber(sectionNumber: number): Promise<Section> {
    try {
      const response = await api.get(`/sections/number/${sectionNumber}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching section with number ${sectionNumber}:`, error);
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

  async updateSection(id: string, sectionData: Partial<Omit<Section, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Section> {
    try {
      const response = await api.put(`/sections/${id}`, sectionData);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating section with id ${id}:`, error);
      throw error;
    }
  },

  async deleteSection(id: string): Promise<void> {
    try {
      await api.delete(`/sections/${id}`);
    } catch (error) {
      console.error(`Error deleting section with id ${id}:`, error);
      throw error;
    }
  }
}; 