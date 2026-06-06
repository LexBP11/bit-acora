import React, { useState, useEffect } from 'react';
import { reporteService } from '../../services/reporteService';
import type { ReportePeriodo } from '../../interfaces';
import { formatDateToBack } from '../../utils/dateFormatter';
import { FiCalendar, FiDollarSign, FiMapPin, FiActivity } from 'react-icons/fi';

const DashboardReportes = () => {
  const defaultInicio = new Date();
  defaultInicio.setMonth(0);
  defaultInicio.setDate(1);

  const [fechaInicio, setFechaInicio] = useState<string>(formatDateToBack(defaultInicio));
  const [fechaFin, setFechaFin] = useState<string>(formatDateToBack(new Date()));
  const [reporte, setReporte] = useState<ReportePeriodo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReporte = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await reporteService.getPorPeriodo(fechaInicio, fechaFin);
        setReporte(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar el reporte del periodo');
      } finally {
        setLoading(false);
      }
    };

    fetchReporte();
  }, [fechaInicio, fechaFin]);

  return (
    <div className="p-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Reportes Globales</h1>
      <p className="text-lg text-gray-600 mb-8">
        Visualiza el balance general y las métricas de todos tus viajes.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 mb-10">
        <div className="flex-1 flex items-center gap-3 w-full">
          <FiCalendar className="text-gray-400" size={24} />
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha Inicio</label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 w-full">
          <FiCalendar className="text-gray-400" size={24} />
          <div className="w-full">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha Fin</label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-lg animate-pulse">Cargando métricas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
          <p className="text-red-600 font-semibold text-lg mb-2">Error al cargar reporte</p>
          <p className="text-red-500">{error}</p>
        </div>
      ) : reporte ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FiDollarSign size={32} className="text-blue-600" />
            </div>
            <p className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-xs">Total Presupuestado</p>
            <p className="text-3xl font-bold text-gray-900">${reporte.presupuestoTotal}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <FiActivity size={32} className="text-red-600" />
            </div>
            <p className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-xs">Total Gastado</p>
            <p className="text-3xl font-bold text-gray-900">${reporte.gastoTotal}</p>
          </div>

          <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-center items-center text-center ${reporte.balanceTotal >= 0 ? 'border-green-100' : 'border-red-100'}`}>
            <div className={`p-4 rounded-full mb-4 ${reporte.balanceTotal >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <FiDollarSign size={32} />
            </div>
            <p className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-xs">Balance Global</p>
            <p className={`text-3xl font-bold ${reporte.balanceTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {reporte.balanceTotal >= 0 ? `+$${reporte.balanceTotal}` : `-$${Math.abs(reporte.balanceTotal)}`}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <FiMapPin size={32} className="text-indigo-600" />
            </div>
            <p className="text-gray-500 font-semibold mb-1 uppercase tracking-wider text-xs">Viajes Analizados</p>
            <p className="text-3xl font-bold text-gray-900">{reporte.viajesRealizados}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No hay datos disponibles para este periodo.
        </div>
      )}
    </div>
  );
};

export default DashboardReportes;
