import { useState, useEffect, useCallback } from 'react';
import { reporteService } from '../services/reporteService';
import type { ReporteViaje } from '../interfaces';

export const useReporteViaje = (itinerarioId: string) => {
  const [reporte, setReporte] = useState<ReporteViaje | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReporte = useCallback(async () => {
    if (!itinerarioId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await reporteService.getPorViaje(itinerarioId);
      setReporte(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el reporte del viaje');
    } finally {
      setLoading(false);
    }
  }, [itinerarioId]);

  useEffect(() => {
    fetchReporte();
  }, [fetchReporte]);

  return { reporte, loading, error, refetch: fetchReporte };
};
