import api from '../api/axiosConfig';
import type { Itinerario } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const itinerarioService = {
  create: async (data: Partial<Itinerario>): Promise<Itinerario> => {
    try {
      const response = await api.post('/itinerarios', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getAll: async (): Promise<Itinerario[]> => {
    try {
      const response = await api.get('/itinerarios');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getDestacados: async (): Promise<Itinerario[]> => {
    try {
      const response = await api.get('/itinerarios/destacados');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string): Promise<Itinerario> => {
    try {
      const response = await api.get(`/itinerarios/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id: string, data: Partial<Itinerario>): Promise<Itinerario> => {
    try {
      const response = await api.put(`/itinerarios/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateVisibilidad: async (id: string): Promise<Itinerario> => {
    try {
      const response = await api.patch(`/itinerarios/${id}/visibilidad`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/itinerarios/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
