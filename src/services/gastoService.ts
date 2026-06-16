import api from '../api/axiosConfig';
import type { Gasto, AlertaPresupuesto } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const gastoService = {
  create: async (data: Partial<Gasto>): Promise<Gasto> => {
    try {
      const response = await api.post('/gastos', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getByItinerario: async (itinerarioId: string): Promise<Gasto[]> => {
    try {
      const response = await api.get(`/gastos/itinerario/${itinerarioId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getAlertas: async (itinerarioId: string): Promise<AlertaPresupuesto> => {
    try {
      const response = await api.get(`/gastos/alertas/${itinerarioId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Gasto>): Promise<Gasto> => {
    try {
      const response = await api.put(`/gastos/${id}`, data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/gastos/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
