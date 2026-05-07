import api from '../api/axiosConfig';
import type { Actividad } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const actividadService = {
  create: async (data: Partial<Actividad>): Promise<Actividad> => {
    try {
      const response = await api.post('/actividades', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id: string, data: Partial<Actividad>): Promise<Actividad> => {
    try {
      const response = await api.put(`/actividades/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/actividades/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
