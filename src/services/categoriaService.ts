import api from '../api/axiosConfig';
import type { Categoria } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};
