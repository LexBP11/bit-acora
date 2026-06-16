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
      throw error;
    }
  },

  getAll: async (): Promise<Itinerario[]> => {
    try {
      const response = await api.get('/itinerarios');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getDestacados: async (): Promise<Itinerario[]> => {
    try {
      const response = await api.get('/itinerarios/destacados');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Itinerario> => {
    try {
      const response = await api.get(`/itinerarios/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Itinerario>): Promise<Itinerario> => {
    try {
      const response = await api.put(`/itinerarios/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  uploadPortada: async (id: string, portada?: File | null, imagenes?: File[]): Promise<Itinerario> => {
    try {
      const formData = new FormData();
      if (portada) {
        formData.append('portada', portada);
      }
      if (imagenes && imagenes.length > 0) {
        imagenes.forEach(img => formData.append('imagenes', img));
      }
      const response = await api.post(`/itinerarios/${id}/portada`, formData, {
        headers: { 'Content-Type': undefined },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updateVisibilidad: async (id: string): Promise<Itinerario> => {
    try {
      const response = await api.patch(`/itinerarios/${id}/visibilidad`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/itinerarios/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
