import api from '../api/axiosConfig';
import type { Itinerario } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const sugerenciaService = {
  generar: async (): Promise<Itinerario[]> => {
    try {
      const response = await api.post('/sugerencias/generar');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
