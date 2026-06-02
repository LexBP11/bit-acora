import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';

const Finanzas = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Estados solo para la vista (UI mock)
  const [gastoNombre, setGastoNombre] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  // Estados para resumen izquierdo
  const [presupuesto, setPresupuesto] = useState<number>(0);
  const [duracionDias, setDuracionDias] = useState<number>(1);
  const [gastosPorDia, setGastosPorDia] = useState<{ [dia: number]: { monto: number, concepto: string } }>(() => {
    if (id) {
      const saved = localStorage.getItem(`gastos_${id}`);
      if (saved) return JSON.parse(saved);
    }
    return {};
  });
  
  // Estado para día seleccionado en la derecha
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(1);

  useEffect(() => {
    const loadPresupuesto = async () => {
      if (id) {
        try {
          const data = await itinerarioService.getById(id);
          if (data) {
            if (data.presupuesto !== undefined) {
              setPresupuesto(data.presupuesto);
            }
            if (data.fechaInicio && data.fechaFin) {
              const diff = Math.ceil(
                (new Date(data.fechaFin).getTime() - new Date(data.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
              );
              setDuracionDias(diff > 0 ? diff + 1 : 1);
            }
          }
        } catch (error) {
          console.error("Error al cargar itinerario:", error);
        }
      }
    };
    loadPresupuesto();
  }, [id]);

  // Actualizar días disponibles y auto-seleccionar el primero disponible
  const diasDisponibles = Array.from({ length: duracionDias }, (_, i) => i + 1)
    .filter(d => !gastosPorDia[d]);

  useEffect(() => {
    if (diasDisponibles.length > 0 && !diasDisponibles.includes(diaSeleccionado)) {
      setDiaSeleccionado(diasDisponibles[0]);
    }
  }, [gastosPorDia, duracionDias, diaSeleccionado, diasDisponibles]);

  const gastoTotal = Object.values(gastosPorDia).reduce((acc, curr) => acc + curr.monto, 0);
  const restante = presupuesto - gastoTotal;

  const handleGuardarGastoDelDia = () => {
    const val = parseFloat(montoTotal);
    if (!isNaN(val) && val > 0 && diaSeleccionado) {
      const updated = {
        ...gastosPorDia,
        [diaSeleccionado]: { monto: val, concepto: gastoNombre || 'Sin concepto' }
      };
      setGastosPorDia(updated);
      if (id) {
        localStorage.setItem(`gastos_${id}`, JSON.stringify(updated));
      }
      setMontoTotal('');
      setGastoNombre('');
    }
  };



  return (
    <div className="p-12 max-w-6xl mx-auto h-screen overflow-y-auto bg-white">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Ver itinerario</h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 text-xl font-medium"
        >
          <FiArrowLeft size={24} />
          Finanzas
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Columna Izquierda: Resumen */}
        <div className="flex-1 bg-slate-200 p-8 rounded-xl shadow-sm border border-slate-300">
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Presupuesto:</span>
              <span className="text-xl font-bold text-gray-800">${presupuesto}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Gastos:</span>
              <span className="text-xl font-bold text-gray-800">${gastoTotal}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Restante:</span>
              <span className={`text-xl font-bold ${restante < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                ${restante}
              </span>
            </div>

          </div>
        </div>

        {/* Columna Derecha: Ingresar Gasto */}
        <div className="flex-1 bg-slate-200 p-8 rounded-xl shadow-sm border border-slate-300 flex flex-col justify-between relative">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-8">Ingresa un gasto:</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Gasto del día:
                </label>
                <select
                  value={diaSeleccionado}
                  onChange={(e) => setDiaSeleccionado(parseInt(e.target.value))}
                  disabled={diasDisponibles.length === 0}
                  className="flex-1 bg-transparent border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none text-lg font-medium text-gray-800 pb-1 disabled:opacity-50"
                >
                  {diasDisponibles.length > 0 ? (
                    diasDisponibles.map(d => (
                      <option key={d} value={d}>
                        Día {d}
                      </option>
                    ))
                  ) : (
                    <option value={0}>Todos los días registrados</option>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Concepto:
                </label>
                <input
                  type="text"
                  placeholder="Ingresar"
                  value={gastoNombre}
                  onChange={(e) => setGastoNombre(e.target.value)}
                  className="flex-1 bg-transparent border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none text-lg font-medium text-gray-800 placeholder-gray-500 pb-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-lg font-bold text-gray-800 whitespace-nowrap">
                  Monto total:
                </label>
                <div className="flex-1 flex items-center gap-2 border-b-2 border-slate-400 focus-within:border-blue-500 pb-1">
                  <span className="text-lg font-bold text-gray-800">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="$$$"
                    value={montoTotal}
                    onChange={(e) => {
                       const val = parseFloat(e.target.value);
                       if (val < 0) return;
                       setMontoTotal(e.target.value);
                    }}
                    className="w-full bg-transparent focus:outline-none text-lg font-bold text-gray-800 placeholder-gray-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 mt-6 border-t border-slate-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Registro de cada día:
              </h3>
              {Object.keys(gastosPorDia).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(gastosPorDia).map(([dia, data]) => (
                    <div key={dia} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Día {dia}</p>
                        <p className="text-slate-600 text-sm">{data.concepto}</p>
                      </div>
                      <span className="font-bold text-gray-800">${data.monto}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No hay gastos registrados aún.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-12 gap-4">
            <button 
              onClick={handleGuardarGastoDelDia}
              disabled={diasDisponibles.length === 0}
              className="bg-blue-500 text-white font-semibold text-lg py-2 px-8 rounded-lg hover:bg-blue-600 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar gasto del día
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finanzas;
