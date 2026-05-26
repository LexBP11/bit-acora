import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import ItinerarioCard from '../../components/ItinerarioCard';
import { useAuth } from '../../contexts/AuthContext';
import { itinerarioService } from '../../services/itinerarioService';
import { getImagenDestino } from '../../utils/imagenHelper';

interface Itinerario {
  id: string;
  destino: string;
  imagen?: string;
  notas: string;
  usuarioId: string;
  usuario?: { nombre: string };
  actividades: { nombre: string; icono?: string }[];
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        setLoading(true);
        // Primero intenta con destacados, si no funciona usa getAll
        let data = await itinerarioService.getDestacados();
        if (!data || data.length === 0) {
          data = await itinerarioService.getAll();
        }

        // Filtrar para mostrar solo los itinerarios de otros usuarios
        if (data && user) {
          data = data.filter((it: any) => it.usuarioId !== user.id);
        }
        
        // Si aún está vacío, usa datos de prueba realistas con imágenes
        if (!data || data.length === 0) {
          console.warn('No hay itinerarios, usando datos de prueba');
          data = [
            {
              id: '1',
              destino: 'París, Francia',
              imagen: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=300&fit=crop',
              notas: 'Explora la ciudad del amor, visitando la Torre Eiffel, el Louvre y disfrutando de la gastronomía francesa.',
              usuarioId: 'user1',
              usuario: { nombre: 'Juan' },
              actividades: [
                { nombre: 'Torre Eiffel', icono: '🗼' },
                { nombre: 'Museos', icono: '🎨' },
                { nombre: 'Restaurantes', icono: '🍽️' },
                { nombre: 'Paseos', icono: '🚶' }
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
                { nombre: 'Compras', icono: '🛍️' }
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
                { nombre: 'Naturaleza', icono: '🌸' }
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
                { nombre: 'Restaurantes', icono: '🍽️' }
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
                { nombre: 'Fotografía', icono: '📸' }
              ]
            }
          ];
        }
        
        // Volver a filtrar si se usaron datos de prueba y coincidiera algún ID
        if (data && user) {
          data = data.filter((it: any) => it.usuarioId !== user.id);
        }
        
        setItinerarios(data || []);
      } catch (error) {
        console.error('Error al cargar itinerarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerarios();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredItinerarios = itinerarios.filter((it) =>
    it.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-12">
      {/* Título */}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Inicio</h1>
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
        ) : filteredItinerarios.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredItinerarios.map((itinerario) => {
              const activitiesWithIcons = itinerario.actividades?.map((act) => ({
                nombre: act.nombre,
                icono: '🎯',
              })) || [];

              return (
                <ItinerarioCard
                  key={itinerario.id}
                  itinerario={{
                    id: itinerario.id,
                    titulo: itinerario.destino,
                    descripcion: itinerario.notas || 'Sin descripción',
                    imagen: itinerario.imagen || getImagenDestino(itinerario.destino),
                    usuarioNombre: itinerario.usuario?.nombre || 'Usuario',
                    usuarioInicial: itinerario.usuario?.nombre
                      ? itinerario.usuario.nombre.charAt(0).toUpperCase()
                      : 'U',
                    actividades: activitiesWithIcons,
                  }}
                  onClick={() => navigate(`/itinerarios/${itinerario.id}/detalle`)}
                />
              );
            })}
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
