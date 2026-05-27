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
  const [gastos, setGastos] = useState<string>('');

  useEffect(() => {
    const loadPresupuesto = async () => {
      if (id) {
        try {
          const data = await itinerarioService.getById(id);
          if (data && data.presupuesto !== undefined) {
            setPresupuesto(data.presupuesto);
          }
        } catch (error) {
          console.error("Error al cargar itinerario:", error);
        }
      }
    };
    loadPresupuesto();
  }, [id]);

  const gastosNum = parseFloat(gastos) || 0;
  const restante = presupuesto - gastosNum;

  const categorias = [
    { id: 'comida', nombre: 'Comida', icono: '🍽️' },
    { id: 'entretenimiento', nombre: 'Entretenimiento', icono: '🎭' },
    { id: 'otro', nombre: 'Otro', icono: '📦' }
  ];

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
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-800">$</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={gastos}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < 0) return;
                    setGastos(e.target.value);
                  }}
                  className="w-24 bg-transparent border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none text-xl font-bold text-gray-800 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-slate-300 pb-4">
              <span className="text-xl font-bold text-gray-800">Restante:</span>
              <span className={`text-xl font-bold ${restante < 0 ? 'text-red-500' : 'text-gray-800'}`}>
                ${restante}
              </span>
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Categorias de los gastos:</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full font-medium shadow-sm flex items-center gap-2 border border-amber-100">
                  🍽️ Comida
                </span>
                {/* Puedes añadir más chips aquí estáticos */}
              </div>
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
                  Gasto que se realizo:
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

              <div className="pt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Seleccione la categorias del gasto:
                </h3>
                <div className="flex flex-wrap gap-3">
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaSeleccionada(cat.id)}
                      className={`px-4 py-2 rounded-full font-medium shadow-sm flex items-center gap-2 border transition ${
                        categoriaSeleccionada === cat.id
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                      }`}
                    >
                      <span>{cat.icono}</span>
                      {cat.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-12">
            <button 
              onClick={() => navigate(`/itinerarios/${id}/detalle`)}
              className="bg-blue-500 text-white font-semibold text-lg py-2 px-8 rounded-lg hover:bg-blue-600 transition shadow-md"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finanzas;
