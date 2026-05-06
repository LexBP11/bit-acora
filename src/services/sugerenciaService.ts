import api from '../api/axiosConfig';
import { Itinerario } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const sugerenciaService = {
  generar: async (): Promise<Itinerario[]> => {
    try {
      // El doc.back indica que puede ser GET o POST. Usamos POST por convención para una acción de generar
      // o GET si ya existe. Lo dejamos en GET según la especificación /api/sugerencias/generar
      const response = await api.get('/sugerencias/generar');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
