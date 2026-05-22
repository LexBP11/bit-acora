import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
  onPrev: () => void;
  onNext: () => void;
  onClick: () => void;
}

const ItinerarioCard: React.FC<ItinerarioCardProps> = ({
  itinerario,
  onPrev,
  onNext,
  onClick,
}) => {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-3xl shadow-sm overflow-hidden transition hover:shadow-md">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-300 bg-slate-100">
        <div className="w-12 h-12 rounded-full bg-slate-500 text-white flex items-center justify-center text-lg font-semibold">
          {itinerario.usuarioInicial}
        </div>
        <div>
          <p className="text-sm text-slate-500">Usuario</p>
          <p className="text-base font-semibold text-slate-900">
            {itinerario.usuarioNombre}
          </p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1.5fr_1fr] gap-6 p-6 items-start">
        <div className="relative rounded-3xl overflow-hidden bg-slate-200 min-h-[310px] flex items-center justify-center">
          {itinerario.imagen ? (
            <img
              src={itinerario.imagen}
              alt={itinerario.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              Sin imagen
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
            aria-label="Anterior itinerario"
          >
            <FiChevronLeft size={24} className="text-slate-800" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
            aria-label="Siguiente itinerario"
          >
            <FiChevronRight size={24} className="text-slate-800" />
          </button>
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div>
            <h3
              className="text-2xl font-bold text-slate-900 cursor-pointer hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              role="button"
              aria-label={`Abrir itinerario ${itinerario.titulo}`}
            >
              {itinerario.titulo}
            </h3>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Descripción
              </p>
              <p className="text-slate-600 leading-7">
                {itinerario.descripcion}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.12em] mb-3">
              Actividad
            </p>
            <div className="flex flex-wrap gap-2">
              {itinerario.actividades.slice(0, 4).map((actividad, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1"
                >
                  <span className="text-base">{actividad.icono}</span>
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
