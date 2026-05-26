import React from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface ItinerarioCard {
  id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  usuarioNombre: string;
  usuarioInicial: string;
  actividades: { nombre: string; icono: string }[];
}

interface ItinerarioCardProps {
  itinerario: ItinerarioCard;
  onPrev?: () => void;
  onNext?: () => void;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const ItinerarioCard: React.FC<ItinerarioCardProps> = ({
  itinerario,
  onPrev,
  onNext,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex">
        {/* Sección Izquierda - Usuario e Imagen */}
        <div className="w-1/3 bg-gray-200 flex flex-col items-center justify-center p-6 relative">
          {/* Avatar del usuario */}
          <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">
              {itinerario.usuarioInicial}
            </span>
          </div>
          <p className="text-gray-700 font-semibold text-center mb-4">
            {itinerario.usuarioNombre}
          </p>

          {/* Imagen del itinerario */}
          <div className="w-full h-40 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
            {itinerario.imagen ? (
              <img
                src={itinerario.imagen}
                alt={itinerario.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-24 h-24 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
              </svg>
            )}
          </div>

          {/* Botones de navegación (opcionales) */}
          {onPrev && onNext && (
            <div className="flex justify-between w-full mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="p-2 hover:bg-gray-300 rounded transition"
              >
                <FiChevronLeft size={24} className="text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="p-2 hover:bg-gray-300 rounded transition"
              >
                <FiChevronRight size={24} className="text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {/* Sección Derecha - Contenido */}
        <div className="w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {itinerario.titulo}
              </h3>
              {(onEdit || onDelete) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(e); }}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition"
                      title="Editar itinerario"
                    >
                      <FiEdit2 size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(e); }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                      title="Borrar itinerario"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="mb-3">
              <p className="text-sm font-semibold text-gray-600">Descripción:</p>
              <p className="text-gray-600 text-sm line-clamp-2">
                {itinerario.descripcion}
              </p>
            </div>
          </div>

          {/* Actividades */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">Actividad</p>
            <div className="space-y-1">
              {itinerario.actividades.slice(0, 2).map((actividad, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-lg">{actividad.icono}</span>
                  <span className="text-sm text-amber-700 font-medium">
                    {actividad.nombre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItinerarioCard;
