import type { Itinerario } from '../interfaces';

export const calcularDuracionDias = (fechaInicio?: string, fechaFin?: string): number => {
  if (!fechaInicio || !fechaFin) return 1;
  const diff = Math.ceil(
    (new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
  );
  return isNaN(diff) || diff < 0 ? 1 : diff + 1;
};

export const agruparActividadesPorDia = (itinerario: Itinerario) => {
  const duracionDias = calcularDuracionDias(itinerario.fechaInicio, itinerario.fechaFin);
  const actividades = itinerario.actividades ?? [];

  return Array.from({ length: duracionDias }, (_, i) => ({
    dia: i + 1,
    actividades: actividades.filter((act) => {
      if (act.fecha && itinerario.fechaInicio) {
        const actTime = new Date(act.fecha.split('T')[0]).getTime();
        const startTime = new Date(itinerario.fechaInicio.split('T')[0]).getTime();
        const diffDays = Math.floor((actTime - startTime) / (1000 * 60 * 60 * 24));
        return diffDays === i;
      }
      return Math.floor(actividades.indexOf(act) / 2) === i;
    }),
  }));
};
