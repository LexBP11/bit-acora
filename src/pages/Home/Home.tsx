import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import ItinerarioCard from '../../components/ItinerarioCard';
import { useAuth } from '../../contexts/AuthContext';
import { itinerarioService } from '../../services/itinerarioService';
import { sugerenciaService } from '../../services/sugerenciaService';
import { getImagenDestino, getPortadaUrl, getAvatarUrl } from '../../utils/imagenHelper';
import type { Itinerario } from '../../interfaces';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSugerencias, setShowSugerencias] = useState(false);

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        setLoading(true);
        setError(null);

        let data: Itinerario[] = [];

        if (showSugerencias) {
          data = await sugerenciaService.generar() || [];
        } else {
          data = await itinerarioService.getDestacados() || [];
          if (data.length === 0) {
            data = await itinerarioService.getAll() || [];
          }
        }

        if (data && user && !showSugerencias) {
          data = data.filter((it) => it.usuarioId !== user.id);
        }

        setItinerarios(data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('No se pudieron cargar los itinerarios');
        }
        setItinerarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerarios();
  }, [user, showSugerencias]);

  const filteredItinerarios = itinerarios.filter((it) =>
    it.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Inicio</h1>
      <p className="text-lg text-gray-600 mb-8">
        ¡Hola, {user?.nombre || 'Usuario'} Viajero!
      </p>

      <div className="mb-12 relative max-w-2xl">
        <FiSearch className="absolute left-4 top-4 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Busca un itinerario"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {showSugerencias ? 'Itinerarios sugeridos para ti' : 'Itinerarios destacados'}
          </h2>

          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={showSugerencias}
                onChange={() => setShowSugerencias(!showSugerencias)}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${showSugerencias ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showSugerencias ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              Sugerencias personalizadas
            </div>
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Cargando itinerarios...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 text-lg font-medium mb-2">Error al cargar itinerarios</p>
            <p className="text-red-500 text-sm">{error}</p>
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
                    imagen: getPortadaUrl(itinerario.portadaUrl) || getImagenDestino(itinerario.destino),
                    usuarioNombre: itinerario.usuario?.nombre || 'Usuario',
                    usuarioInicial: itinerario.usuario?.nombre
                      ? itinerario.usuario.nombre.charAt(0).toUpperCase()
                      : 'U',
                    usuarioAvatarUrl: getAvatarUrl(itinerario.usuario?.avatarUrl),
                    actividades: activitiesWithIcons,
                  }}
                  onClick={() => navigate(`/itinerarios/${itinerario.id}/detalle`)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg border border-gray-100">
            <p className="text-gray-500 text-lg mb-4 text-center">
              {searchTerm
                ? 'No hay itinerarios que coincidan con tu búsqueda'
                : 'Aún no hay viajes para explorar. ¡Anímate a crear el primero!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/itinerarios/crear')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Crear itinerario
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
