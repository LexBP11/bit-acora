import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
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


  const actividadesConCoords = actividadesDelDia.filter(
    (a) => a.latitud !== undefined && a.latitud !== null && a.longitud !== undefined && a.longitud !== null
  );

  const mapCenter: [number, number] = actividadesConCoords.length > 0
    ? [actividadesConCoords[0].latitud!, actividadesConCoords[0].longitud!]
    : [19.4326, -99.1332]; // Default CDMX

  const routePositions: [number, number][] = actividadesConCoords.map(
    (a) => [a.latitud!, a.longitud!]
  );

  return (
    <div className="p-8 lg:p-12 h-screen flex flex-col overflow-hidden">
      <div className="mb-6 flex-shrink-0">
        <button
          onClick={() => navigate(`/itinerarios/${itinerario.id}/detalle`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <FiArrowLeft size={20} />
          Volver al detalle
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Plan del viaje</h1>
        <p className="text-xl text-blue-600 font-semibold mb-6">{itinerario.destino}</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Columna Izquierda: Tabs y Actividades */}
        <div className="w-full md:w-5/12 lg:w-4/12 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 flex-shrink-0">
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Actividades del día {selectedDia}
            </h2>

            {actividadesDelDia.length > 0 ? (
              <div className="space-y-4">
                {actividadesDelDia.map((actividad) => (
                  <div
                    key={actividad.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition"
                  >
                    <h3 className="font-bold text-gray-900 mb-1">{actividad.nombre}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {actividad.descripcion || 'Sin descripción'}
                    </p>
                    {actividad.direccion && (
                      <p className="text-sm text-gray-500 flex items-start gap-1">
                        <FiMapPin className="mt-1 flex-shrink-0" />
                        <span>{actividad.direccion}</span>
                      </p>
                    )}
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

        {/* Columna Derecha: Mapa */}
        <div className="w-full md:w-7/12 lg:w-8/12 h-[500px] md:h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 z-0 relative">
          <MapContainer
            key={selectedDia} // Reinstanciar el mapa al cambiar de día para centrar automáticamente
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', minHeight: '500px', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {actividadesConCoords.map((act) => (
              <Marker key={act.id} position={[act.latitud!, act.longitud!]}>
                <Popup>
                  <strong className="text-blue-600 block mb-1">{act.nombre}</strong>
                  {act.direccion && <span className="text-gray-600 text-sm">{act.direccion}</span>}
                </Popup>
              </Marker>
            ))}
            {routePositions.length > 1 && (
              <Polyline
                positions={routePositions}
                color="blue"
                weight={4}
                opacity={0.7}
                dashArray="10, 10"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default VerItinerario;
