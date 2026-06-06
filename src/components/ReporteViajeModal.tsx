import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReporteViaje } from '../hooks/useReporteViaje';
import { FiX } from 'react-icons/fi';

interface ReporteViajeModalProps {
  itinerarioId: string;
  onClose: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6666'];

const ReporteViajeModal: React.FC<ReporteViajeModalProps> = ({ itinerarioId, onClose }) => {
  const { reporte, loading, error } = useReporteViaje(itinerarioId);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
          <p className="text-xl font-semibold text-gray-700 animate-pulse">Cargando balance general...</p>
        </div>
      </div>
    );
  }

  if (error || !reporte) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center">
          <p className="text-xl font-semibold text-red-600 mb-4">Error al cargar reporte</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cerrar</button>
        </div>
      </div>
    );
  }

  // Convertir el desglose a formato array para recharts
  const data = Object.entries(reporte.desglosePorCategoria || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Balance General del Viaje</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Presupuesto</p>
              <p className="text-2xl font-bold text-blue-900">${reporte.presupuesto}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
              <p className="text-sm text-red-600 font-semibold uppercase tracking-wide">Gastado</p>
              <p className="text-2xl font-bold text-red-900">${reporte.totalGastado}</p>
            </div>
            <div className={`p-4 rounded-xl border text-center ${reporte.balance >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              <p className={`text-sm font-semibold uppercase tracking-wide ${reporte.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>Balance Final</p>
              <p className={`text-2xl font-bold ${reporte.balance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {reporte.balance >= 0 ? `+$${reporte.balance}` : `-$${Math.abs(reporte.balance)}`}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Desglose de Gastos por Categoría</h3>
            {data.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 italic mt-8">Aún no hay gastos registrados para generar una gráfica.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReporteViajeModal;
