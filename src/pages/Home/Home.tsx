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
  actividades: { nombre: string; icono?: string }[];
}

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
        setItinerarios(data || []);
      } catch (error) {
        console.error('Error al cargar itinerarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerarios();
  }, []);

  const handleNextItinerario = () => {
    setCurrentIndex((prev) => (prev + 1) % (itinerarios.length || 1));
  };

  const handlePrevItinerario = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? (itinerarios.length || 1) - 1 : prev - 1
    );
  };

  const handleItinerarioClick = () => {
    if (itinerarios[currentIndex]) {
      navigate(`/itinerarios/${itinerarios[currentIndex].id}/detalle`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredItinerarios = itinerarios.filter((it) =>
    it.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItinerario = filteredItinerarios[currentIndex] || itinerarios[0];

  // Mapear actividades con iconos
  const activitiesWithIcons = currentItinerario?.actividades?.map((act) => ({
    nombre: act.nombre,
    icono: '🎯', // Ícono por defecto, puedes personalizar según tipo
  })) || [];

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
              }}
              onNext={handleNextItinerario}
              onPrev={handlePrevItinerario}
              onClick={handleItinerarioClick}
            />
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
