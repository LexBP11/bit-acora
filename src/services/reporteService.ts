import api from '../api/axiosConfig';
import { ReporteViaje, ReportePeriodo } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const reporteService = {
  getPorViaje: async (itinerarioId: string): Promise<ReporteViaje> => {
    try {
      const response = await api.get(`/reportes/viaje/${itinerarioId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getPorPeriodo: async (inicio: string, fin: string): Promise<ReportePeriodo> => {
    try {
      // Pasando parámetros query mediante axios { params }
      const response = await api.get('/reportes/periodo', {
        params: { inicio, fin }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};
