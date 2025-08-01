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
      // Request all sections with a high limit to bypass pagination
      const response = await api.get('/sections?limit=99999');
      console.log(`Fetched ${response.data.data.length} sections from backend`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  },

  async getSectionsWithPagination(page: number = 1, limit: number = 15): Promise<{sections: Section[], count: number, totalPages: number, currentPage: number, totalCount: number}> {
    try {
      const response = await api.get(`/sections?page=${page}&limit=${limit}`);
      return {
        sections: response.data.data,
        count: response.data.count,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        totalCount: response.data.totalCount || response.data.data.length
      };
    } catch (error) {
      console.error('Error fetching sections with pagination:', error);
      throw error;
    }
  },

  async getAllSectionsCount(): Promise<{totalSections: number, sectionsByCategory: Record<string, number>}> {
    try {
      const response = await api.get('/sections/counts');
      return {
        totalSections: response.data.data.totalCount,
        sectionsByCategory: response.data.data.countsByCategory
      };
    } catch (error) {
      console.error('Error fetching sections count:', error);
      // Fallback to the old method if the new endpoint is not available
      try {
        const fallbackResponse = await api.get('/sections?limit=99999');
        const allSections = fallbackResponse.data.data;
        
        const sectionsByCategory = allSections.reduce((acc: Record<string, number>, section: Section) => {
          acc[section.category] = (acc[section.category] || 0) + 1;
          return acc;
        }, {});
        
        return {
          totalSections: allSections.length,
          sectionsByCategory
        };
      } catch (fallbackError) {
        console.error('Error with fallback sections count:', fallbackError);
        throw error;
      }
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