import { useState, useEffect } from 'react';
import { Itinerario } from '../interfaces';
import { itinerarioService } from '../services/itinerarioService';

/**
 * Hook para obtener el detalle de un itinerario (incluyendo actividades y gastos).
 * Gestiona el estado de carga y propaga limpiamente los errores para la UI.
 * 
 * @param id El ID del itinerario a buscar
 */
export const useGetItinerarioDetail = (id: string | undefined) => {
  const [data, setData] = useState<Itinerario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      // Si no hay ID (por ejemplo, aún no está disponible en la URL), evitamos la petición
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Nuestro itinerarioService.getById ya tiene el try/catch y utiliza apiErrorHandler.
        // Si hay un error (ej. 404 Not Found o 401 Unauthorized), la promesa será rechazada y caerá en este catch.
        const result = await itinerarioService.getById(id);
        setData(result);
      } catch (err) {
        // Aprovechamos que nuestro apiErrorHandler arroja instancias de Error de JavaScript
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ha ocurrido un error inesperado al cargar el itinerario');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  return { data, loading, error };
};
