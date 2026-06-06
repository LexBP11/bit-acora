import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';
import type { Itinerario } from '../../interfaces';
import { agruparActividadesPorDia, calcularDuracionDias } from '../../utils/itinerarioHelpers';

const VerItinerario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [itinerario, setItinerario] = useState<Itinerario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDia, setSelectedDia] = useState(1);

  useEffect(() => {
    const fetchItinerario = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await itinerarioService.getById(id);
        setItinerario(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('No se pudo cargar el itinerario');
        }
        setItinerario(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerario();
  }, [id]);

  useEffect(() => {
    setSelectedDia(1);
  }, [id]);

  const duracionDias = itinerario
    ? calcularDuracionDias(itinerario.fechaInicio, itinerario.fechaFin)
    : 1;

  const actividadesPorDia = itinerario ? agruparActividadesPorDia(itinerario) : [];
  const actividadesDelDia =
    actividadesPorDia.find((a) => a.dia === selectedDia)?.actividades || [];

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando plan del viaje...</p>
      </div>
    );
  }

  if (error || !itinerario) {
    return (
      <div className="p-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft size={20} />
          Volver
        </button>
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100">
          <p className="font-semibold text-lg mb-2">
            {error ? 'Error al cargar el itinerario' : 'Itinerario no encontrado'}
          </p>
          {error && <p className="text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(`/itinerarios/${itinerario.id}/detalle`)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold"
      >
        <FiArrowLeft size={20} />
        Volver al detalle
      </button>

      <h1 className="text-4xl font-bold text-gray-900 mb-2">Plan del viaje</h1>
      <p className="text-xl text-blue-600 font-semibold mb-8">{itinerario.destino}</p>

      <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
        {Array.from({ length: duracionDias }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setSelectedDia(i + 1)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition ${
              selectedDia === i + 1
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Día {i + 1}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Actividades del día {selectedDia}
        </h2>

        {actividadesDelDia.length > 0 ? (
          <div className="space-y-4">
            {actividadesDelDia.map((actividad) => (
              <div
                key={actividad.id}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <h3 className="font-bold text-gray-900 mb-1">{actividad.nombre}</h3>
                <p className="text-sm text-gray-600">
                  {actividad.descripcion || 'Sin descripción'}
                </p>
                {actividad.fecha && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(actividad.fecha).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No hay actividades programadas para este día.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerItinerario;
