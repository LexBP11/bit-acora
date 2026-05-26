import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus } from 'react-icons/fi';
import ItinerarioCard from '../../components/ItinerarioCard';
import { useAuth } from '../../contexts/AuthContext';
import { itinerarioService } from '../../services/itinerarioService';
import { getImagenDestino } from '../../utils/imagenHelper';
import { obtenerImagenes, eliminarImagenes } from '../../utils/imageStorage';

interface Itinerario {
  id: string;
  destino: string;
  imagen?: string;
  notas: string;
  usuarioId: string;
  usuario?: { nombre: string };
  actividades: { nombre: string; icono?: string }[];
}

const MisItinerarios = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [itinerarios, setItinerarios] = useState<Itinerario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchItinerarios = async () => {
      try {
        setLoading(true);
        if (!user) return;
        const data = await itinerarioService.getAll();
        if (data) {
          const misViajes = data.filter((it: any) => it.usuarioId === user.id);
          setItinerarios(misViajes);
        }
      } catch (error) {
        console.error('Error al cargar mis itinerarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerarios();
  }, [user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredItinerarios = itinerarios.filter((it) =>
    it.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas borrar este itinerario? Esta acción no se puede deshacer.")) {
      try {
        await itinerarioService.delete(id);
        eliminarImagenes(id);
        setItinerarios(itinerarios.filter(it => it.id !== id));
      } catch (error) {
        console.error(error);
        alert("Error al borrar el itinerario");
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/itinerarios/crear?id=${id}`);
  };

  return (
    <div className="p-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Mis Itinerarios</h1>
      </div>

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

      <div>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Cargando tus itinerarios...</p>
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
                    imagen: (() => {
                      const saved = obtenerImagenes(itinerario.id);
                      return saved ? saved[0] : (itinerario.imagen || getImagenDestino(itinerario.destino));
                    })(),
                    usuarioNombre: itinerario.usuario?.nombre || user?.nombre || 'Yo',
                    usuarioInicial: (itinerario.usuario?.nombre || user?.nombre || 'Y').charAt(0).toUpperCase(),
                    actividades: activitiesWithIcons,
                  }}
                  onClick={() => navigate(`/itinerarios/${itinerario.id}/detalle`)}
                  onEdit={() => handleEdit(itinerario.id)}
                  onDelete={() => handleDelete(itinerario.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm
                ? 'No hay itinerarios que coincidan con tu búsqueda'
                : 'Aún no has creado ningún itinerario'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/itinerarios/crear')}
                className="text-blue-500 font-semibold hover:underline"
              >
                Crea tu primer itinerario
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisItinerarios;
