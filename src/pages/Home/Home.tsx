import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import ItinerarioCard from '../../components/ItinerarioCard';
import { useAuth } from '../../contexts/AuthContext';
import { itinerarioService } from '../../services/itinerarioService';

interface Itinerario {
  id: string;
  destino: string;
  notas: string;
  usuarioId: string;
  usuario?: { nombre: string };
  imagen?: string;
  actividades: { nombre: string; icono?: string }[];
}

const sampleItinerarios: Itinerario[] = [
  {
    id: 'sample-1',
    destino: 'Playa y Gastronomía',
    notas: 'Un fin de semana en la playa con restaurantes, caminatas y atardeceres inolvidables.',
    usuarioId: 'u1',
    usuario: { nombre: 'Camila' },
    imagen:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
    actividades: [
      { nombre: 'Restaurante' },
      { nombre: 'Playa' },
      { nombre: 'Parque' },
    ],
  },
  {
    id: 'sample-2',
    destino: 'Ciudad y cultura',
    notas: 'Recorrido por museos, cafés y plazas centrales para conocer lo mejor de la ciudad.',
    usuarioId: 'u2',
    usuario: { nombre: 'Martín' },
    imagen:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    actividades: [
      { nombre: 'Parque' },
      { nombre: 'Restaurante' },
      { nombre: 'Museo' },
    ],
  },
  {
    id: 'sample-3',
    destino: 'Aventura en la montaña',
    notas: 'Senderismo, vista panorámica y picnic en un itinerario para reconectar con la naturaleza.',
    usuarioId: 'u3',
    usuario: { nombre: 'Sofía' },
    imagen:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    actividades: [
      { nombre: 'Parque' },
      { nombre: 'Aventura' },
      { nombre: 'Café' },
    ],
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        setLoading(true);
        const data = await itinerarioService.getDestacados();
        setItinerarios(data && data.length > 0 ? data : sampleItinerarios);
      } catch (error) {
        console.error('Error al cargar itinerarios:', error);
        setItinerarios(sampleItinerarios);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerarios();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentIndex(0);
  };

  const filteredItinerarios = itinerarios.filter((it) =>
    it.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayItinerarios = searchTerm.trim()
    ? filteredItinerarios
    : itinerarios;
  const hasDisplayItinerarios = displayItinerarios.length > 0;
  const currentItinerario =
    displayItinerarios[currentIndex] || displayItinerarios[0] || sampleItinerarios[0];

  const handleNextItinerario = () => {
    if (!hasDisplayItinerarios) return;
    setCurrentIndex((prev) => (prev + 1) % displayItinerarios.length);
  };

  const handlePrevItinerario = () => {
    if (!hasDisplayItinerarios) return;
    setCurrentIndex((prev) =>
      prev === 0 ? displayItinerarios.length - 1 : prev - 1
    );
  };

  const handleItinerarioClick = () => {
    if (displayItinerarios[currentIndex]) {
      navigate(`/itinerarios/${displayItinerarios[currentIndex].id}/detalle`);
    }
  };

  // Mapear actividades con iconos
  const activitiesWithIcons = currentItinerario?.actividades?.map((act) => ({
    nombre: act.nombre,
    icono: '🎯', // Ícono por defecto, puedes personalizar según tipo
  })) || [];

  return (
    <div className="max-w-7xl mx-auto p-12">
      {/* Título */}
      <h1 className="text-4xl font-bold text-slate-950 mb-2">Inicio</h1>
      <p className="text-lg text-gray-600 mb-8">
        ¡Hola, {user?.nombre || 'Usuario'} Viajero!
      </p>

      {/* Barra de búsqueda */}
      <div className="mb-12 relative max-w-2xl">
        <FiSearch className="absolute left-4 top-4 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Busca un itinerario"
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sección Itinerarios destacados */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Itinerarios destacados
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Cargando itinerarios...</p>
          </div>
        ) : hasDisplayItinerarios ? (
          <div className="space-y-6">
            <ItinerarioCard
              itinerario={{
                id: currentItinerario.id,
                titulo: currentItinerario.destino,
                descripcion: currentItinerario.notas || 'Sin descripción',
                usuarioNombre: currentItinerario.usuario?.nombre || 'Usuario',
                usuarioInicial: currentItinerario.usuario?.nombre
                  ? currentItinerario.usuario.nombre.charAt(0).toUpperCase()
                  : 'U',
                actividades: activitiesWithIcons,
                imagen: currentItinerario.imagen,
              }}
              onNext={handleNextItinerario}
              onPrev={handlePrevItinerario}
              onClick={handleItinerarioClick}
            />
            
              {/* Lista horizontal de otros itinerarios */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Otros itinerarios</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {displayItinerarios.slice(0, 8).map((it, idx) => (
                    <div
                      key={it.id || idx}
                      onClick={() => navigate(`/itinerarios/${it.id}/detalle`)}
                      className="min-w-[200px] bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md"
                    >
                      <div className="w-48 h-28 bg-gray-200 overflow-hidden">
                        {it?.imagen ? (
                          <img
                            src={it.imagen}
                            alt={it.destino}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">Sin imagen</div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-700 truncate">{it.destino}</p>
                        <p className="text-xs text-amber-600 mt-1">{it.actividades?.slice(0,2).map(a=>a.nombre).join(' • ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">
              {searchTerm
                ? 'No hay itinerarios que coincidan con tu búsqueda'
                : 'No hay itinerarios destacados aún'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
