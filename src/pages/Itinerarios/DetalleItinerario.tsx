import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';
import type { Itinerario, Actividad } from '../../interfaces';
import { getImagenesDestino } from '../../utils/imagenHelper';

interface ActividadPorDia {
  dia: number;
  actividades: Actividad[];
}

const DetalleItinerario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [itinerario, setItinerario] = useState<Itinerario | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDia, setSelectedDia] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    const fetchItinerario = async () => {
      try {
        setLoading(true);
        if (id) {
          try {
            const data = await itinerarioService.getById(id);
            setItinerario(data);
          } catch (error) {
            // Si falla la llamada API, usar datos mock
            const mockData = [
              {
                id: '1',
                destino: 'París, Francia',
                imagen: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=300&fit=crop',
                notas: 'Descubre la magia de la ciudad del amor con sus monumentos icónicos y experiencias culturales incomparables.',
                usuarioId: 'user1',
                usuario: { nombre: 'Juan' },
                actividades: [
                  { nombre: 'Torre Eiffel', icono: '🗼' },
                  { nombre: 'Louvre', icono: '🖼️' },
                  { nombre: 'Restaurantes', icono: '🍽️' },
                  { nombre: 'Paseos', icono: '🚶' },
                  { nombre: 'Montmartre', icono: '⛪' },
                  { nombre: 'Arco de Triunfo', icono: '🏛️' }
                ]
              },
              {
                id: '2',
                destino: 'Barcelona, España',
                imagen: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=500&h=300&fit=crop',
                notas: 'Descubre la arquitectura de Gaudí, playas mediterráneas y la vibrant vida nocturna de la ciudad.',
                usuarioId: 'user2',
                usuario: { nombre: 'María' },
                actividades: [
                  { nombre: 'Sagrada Familia', icono: '⛪' },
                  { nombre: 'Playas', icono: '🏖️' },
                  { nombre: 'Gastronomía', icono: '🍽️' },
                  { nombre: 'Compras', icono: '🛍️' },
                  { nombre: 'Parque Güell', icono: '🌳' },
                  { nombre: 'Casa Batlló', icono: '🏠' }
                ]
              },
              {
                id: '3',
                destino: 'Tokio, Japón',
                imagen: 'https://images.unsplash.com/photo-1549693578-d683be217e58?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHRva3lvfGVufDB8fDB8fHww',
                notas: 'Sumergete en la cultura japonesa, desde templos antiguos hasta tecnología de punta en la metrópolis moderna.',
                usuarioId: 'user3',
                usuario: { nombre: 'Carlos' },
                actividades: [
                  { nombre: 'Templos', icono: '🏯' },
                  { nombre: 'Compras', icono: '🛍️' },
                  { nombre: 'Gastronomía', icono: '🍱' },
                  { nombre: 'Naturaleza', icono: '🌸' },
                  { nombre: 'Shibuya Crossing', icono: '🚦' },
                  { nombre: 'Museo de Tecnología', icono: '🤖' }
                ]
              },
              {
                id: '4',
                destino: 'Nueva York, USA',
                imagen: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=300&fit=crop',
                notas: 'La ciudad que nunca duerme: Times Square, Central Park, Broadway y experiencias urbanas inolvidables.',
                usuarioId: 'user4',
                usuario: { nombre: 'Ana' },
                actividades: [
                  { nombre: 'Times Square', icono: '⏰' },
                  { nombre: 'Teatro', icono: '🎭' },
                  { nombre: 'Compras', icono: '🛍️' },
                  { nombre: 'Restaurantes', icono: '🍽️' },
                  { nombre: 'Central Park', icono: '🌳' },
                  { nombre: 'Estatua de la Libertad', icono: '🗽' }
                ]
              },
              {
                id: '5',
                destino: 'Machu Picchu, Perú',
                imagen: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFjaHUlMjBwaWNjaHV8ZW58MHx8MHx8fDA%3D',
                notas: 'Maravilla del mundo antiguo: senderismo en las montañas de los Andes y descubrimiento de la civilización inca.',
                usuarioId: 'user5',
                usuario: { nombre: 'Pedro' },
                actividades: [
                  { nombre: 'Senderismo', icono: '🥾' },
                  { nombre: 'Arqueología', icono: '🏛️' },
                  { nombre: 'Naturaleza', icono: '🏔️' },
                  { nombre: 'Fotografía', icono: '📸' },
                  { nombre: 'Aguas Calientes', icono: '♨️' },
                  { nombre: 'Montaña Huayna Picchu', icono: '⛰️' }
                ]
              }
            ];
            const found = mockData.find(item => item.id === id);
            if (found) {
              setItinerario(found);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar itinerario:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerario();
  }, [id]);

  useEffect(() => {
    setSelectedDia(1);
    setImageIndex(0);
  }, [id]);

  const duracionDias = (() => {
    if (!itinerario) return 3;
    if (itinerario.fechaInicio && itinerario.fechaFin) {
      const diff = Math.ceil(
        (new Date(itinerario.fechaFin).getTime() -
          new Date(itinerario.fechaInicio).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return isNaN(diff) || diff <= 0 ? 3 : diff;
    }
    return 3;
  })();

  // Agrupar actividades por día
  const actividadesPorDia = itinerario?.actividades
    ? Array.from({ length: duracionDias }, (_, i) => ({
        dia: i + 1,
        actividades: itinerario.actividades!.filter(act => {
          if (act.fecha && itinerario.fechaInicio) {
            const actTime = new Date(act.fecha.split('T')[0]).getTime();
            const startTime = new Date(itinerario.fechaInicio.split('T')[0]).getTime();
            const diffDays = Math.floor((actTime - startTime) / (1000 * 60 * 60 * 24));
            return diffDays === i;
          }
          return Math.floor(itinerario.actividades!.indexOf(act) / 2) === i;
        }),
      }))
    : [];

  const actividadesDelDiaSeleccionado = actividadesPorDia.find(
    (a) => a.dia === selectedDia
  )?.actividades || [];

  const imagenes = itinerario ? getImagenesDestino(itinerario.destino) : [];

  const handleImageNext = () => {
    if (imagenes.length > 0) {
      setImageIndex((prev) => (prev + 1) % imagenes.length);
    }
  };

  const handleImagePrev = () => {
    if (imagenes.length > 0) {
      setImageIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando itinerario...</p>
      </div>
    );
  }

  if (!itinerario) {
    return (
      <div className="p-12">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <FiArrowLeft size={20} />
          Volver
        </button>
        <p className="text-gray-500">Itinerario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-12 max-w-6xl mx-auto">
      {/* Encabezado con botón atrás */}
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
        {/* Sección izquierda - Contenido */}
        <div className="flex-1">
          {/* Título del itinerario */}
          <h2 className="text-3xl font-bold text-blue-600 mb-6">
            {itinerario.destino}
          </h2>

          {/* Descripción */}
          <div className="mb-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
            <p className="text-gray-600">
              {itinerario.notas || 'Sin descripción disponible'}
            </p>
          </div>

          {/* Actividades con tabs */}
          <div>
            <div className="flex items-center gap-4 mb-6">
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

            {/* Listado de actividades */}
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
                    <p className="text-sm text-gray-600 mb-3">
                      {actividad.descripcion || 'Actividad'}
                    </p>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-medium">
                        🍽️ Restaurante
                      </span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full font-medium">
                        🏞️ Parque
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No hay actividades para este día
                </p>
              )}
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Presupuesto</p>
              <p className="text-2xl font-bold text-gray-900">
                ${itinerario.presupuesto}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Duración</p>
              <p className="text-2xl font-bold text-gray-900">
                {duracionDias} {duracionDias === 1 ? 'día' : 'días'}
              </p>
            </div>
          </div>
        </div>

        {/* Sección derecha - Galería */}
        <div className="w-96 flex flex-col items-center">
          <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            {imagenes && imagenes.length > 0 ? (
              <img
                src={imagenes[imageIndex]}
                alt={`${itinerario.destino} ${imageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
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

            {/* Botones de navegación */}
            {imagenes && imagenes.length > 1 && (
              <>
                <button
                  onClick={handleImagePrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                >
                  <FiChevronLeft size={24} className="text-gray-700" />
                </button>
                <button
                  onClick={handleImageNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition"
                >
                  <FiChevronRight size={24} className="text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Indicador de fotos */}
          <div className="mt-4 flex gap-2">
            {imagenes.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  i === imageIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleItinerario;
