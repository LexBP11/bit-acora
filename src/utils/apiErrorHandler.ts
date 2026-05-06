import { AxiosError } from 'axios';

/**
 * Extrae y lanza el mensaje de error de la respuesta del backend
 * de manera consistente, para que los componentes puedan hacer catch directamente.
 */
export const handleApiError = (error: unknown): never => {
  if (error instanceof AxiosError) {
    // Si la respuesta viene del servidor
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || `Error ${error.response.status}: Ha ocurrido un problema`;
      throw new Error(message);
    } 
    // Si no hubo respuesta del servidor (error de red)
    else if (error.request) {
      throw new Error('Error de conexión: No se pudo contactar con el servidor');
    }
  }
  
  // Para errores genéricos de JS que no sean de Axios
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('Error inesperado al procesar la solicitud');
};
