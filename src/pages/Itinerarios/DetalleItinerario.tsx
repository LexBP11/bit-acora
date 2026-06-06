import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';
import type { Itinerario } from '../../interfaces';
import { getPortadaUrl } from '../../utils/imagenHelper';
import { agruparActividadesPorDia, calcularDuracionDias } from '../../utils/itinerarioHelpers';
import { useAuth } from '../../contexts/AuthContext';

const DetalleItinerario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const actividadesDelDiaSeleccionado =
    actividadesPorDia.find((a) => a.dia === selectedDia)?.actividades || [];

  const portadaSrc = itinerario ? getPortadaUrl(itinerario.portadaUrl) : undefined;

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando itinerario...</p>
      </div>
    );
  }

  if (error || !itinerario) {
    return (
      <div className="p-12">
        <button
          onClick={() => navigate('/home')}
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
    <div className="p-12 max-w-6xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-semibold text-lg"
        >
          <FiArrowLeft size={24} />
          Atrás
        </button>
        <h1 className="text-4xl font-bold text-gray-900">Ver itinerario</h1>
      </div>

      <div className="flex gap-8">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            {itinerario.destino}
          </h2>

          <div className="mb-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
            <p className="text-gray-600">
              {itinerario.notas || 'Sin descripción disponible'}
            </p>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-xl font-bold text-gray-900">Días</h3>
                <div className="flex gap-2">
                  {Array.from({ length: duracionDias }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setSelectedDia(i + 1)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        selectedDia === i + 1
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate(`/itinerarios/${itinerario.id}/dias`)}
                className="inline-flex items-center gap-2 bg-[#1E88E5] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition shadow-md self-start"
              >
                <FiCalendar size={18} />
                Ver Itinerario por Días
              </button>
            </div>

            <div className="space-y-4">
              {actividadesDelDiaSeleccionado.length > 0 ? (
                actividadesDelDiaSeleccionado.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <h4 className="font-bold text-gray-900 mb-1">
                      {actividad.nombre}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {actividad.descripcion || 'Actividad'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No hay actividades para este día
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Presupuesto</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${itinerario.presupuesto || 0}
                </p>
              </div>
              {user && itinerario.usuarioId === user.id && (
                <button
                  onClick={() => navigate(`/itinerarios/${itinerario.id}/finanzas`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Ver Finanzas
                </button>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Duración</p>
              <p className="text-2xl font-bold text-gray-900">
                {duracionDias} {duracionDias === 1 ? 'día' : 'días'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-96 flex flex-col items-center">
          <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            {portadaSrc ? (
              <img
                src={portadaSrc}
                alt={itinerario.destino}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-200 via-purple-100 to-gray-100 flex items-center justify-center">
                <svg
                  className="w-48 h-48 text-purple-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2.293L7 5.414a1 1 0 011.414 0l2 2 2.293-2.293a1 1 0 011.414 0l2 2V3a1 1 0 112 0v10a1 1 0 01-1 1H3a1 1 0 01-1-1zm16 3a2 2 0 11-4 0 2 2 0 014 0zm-6-2a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleItinerario;
