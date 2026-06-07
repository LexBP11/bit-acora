import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';
import { actividadService } from '../../services/actividadService';
import { useAuth } from '../../contexts/AuthContext';
import { getPortadaUrl } from '../../utils/imagenHelper';

interface ActivityDraft {
  id: string;
  dayIndex: number;
  nombre: string;
  descripcion: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  isFromServer?: boolean;
}

const CrearItinerario = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { user } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [numDays, setNumDays] = useState(3);
  const [activeDay, setActiveDay] = useState(0);
  const [actividades, setActividades] = useState<ActivityDraft[]>([
    { id: '1', dayIndex: 0, nombre: '', descripcion: '', direccion: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [searchingCoordsId, setSearchingCoordsId] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [portadaUrlServidor, setPortadaUrlServidor] = useState<string | undefined>();
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [esPublico, setEsPublico] = useState(false);

  useEffect(() => {
    return () => {
      if (portadaPreview) {
        URL.revokeObjectURL(portadaPreview);
      }
    };
  }, [portadaPreview]);

  useEffect(() => {
    if (!editId) return;

    const loadItinerario = async () => {
      setLoadingData(true);
      try {
        const data = await itinerarioService.getById(editId);
        if (data) {
          setTitulo(data.destino || '');
          setDescripcion(data.notas || '');
          setPresupuesto(data.presupuesto?.toString() || '');
          if (data.fechaInicio) {
            setFechaInicio(data.fechaInicio.split('T')[0]);
          }
          setPortadaUrlServidor(data.portadaUrl);
          setEsPublico(data.esPublico ?? false);

          if (data.fechaInicio && data.fechaFin) {
            const diff = Math.ceil(
              (new Date(data.fechaFin).getTime() - new Date(data.fechaInicio).getTime()) /
              (1000 * 60 * 60 * 24)
            );
            setNumDays(diff > 0 ? diff + 1 : 3);
          }

          if (data.actividades && data.actividades.length > 0) {
            const mapped: ActivityDraft[] = data.actividades.map((act) => {
              let dayIndex = 0;
              if (act.fecha && data.fechaInicio) {
                const actDate = new Date(act.fecha.split('T')[0]);
                const startD = new Date(data.fechaInicio.split('T')[0]);
                dayIndex = Math.floor(
                  (actDate.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)
                );
                if (dayIndex < 0) dayIndex = 0;
              }
              return {
                id: act.id,
                dayIndex,
                nombre: act.nombre,
                descripcion: act.descripcion || '',
                direccion: act.direccion || '',
                latitud: act.latitud,
                longitud: act.longitud,
                isFromServer: true,
              };
            });
            setActividades(mapped);
          } else {
            setActividades([]);
          }
        }
      } catch (error) {
        console.error('Error al cargar itinerario para edición:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadItinerario();
  }, [editId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy pesada. Máximo 5 MB.');
      return;
    }

    if (portadaPreview) {
      URL.revokeObjectURL(portadaPreview);
    }

    setArchivoPortada(file);
    setPortadaPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    if (portadaPreview) {
      URL.revokeObjectURL(portadaPreview);
    }
    setArchivoPortada(null);
    setPortadaPreview(null);
  };

  const handleAddDay = () => {
    setNumDays((prev) => prev + 1);
  };

  const handleRemoveDay = () => {
    if (numDays <= 1) return;

    const dayIndex = activeDay;
    const actividadesDelDia = actividades.filter((a) => a.dayIndex === dayIndex);
    const tieneContenido = actividadesDelDia.some((a) => a.nombre.trim() || a.descripcion.trim());

    if (
      tieneContenido &&
      !window.confirm('Este día tiene actividades. ¿Deseas eliminarlo de todos modos?')
    ) {
      return;
    }

    actividadesDelDia.forEach((act) => {
      if (act.isFromServer) {
        actividadService.delete(act.id).catch((err) =>
          console.error('Error al eliminar actividad:', err)
        );
      }
    });

    setActividades((prev) =>
      prev
        .filter((a) => a.dayIndex !== dayIndex)
        .map((a) =>
          a.dayIndex > dayIndex ? { ...a, dayIndex: a.dayIndex - 1 } : a
        )
    );
    setNumDays((prev) => prev - 1);
    setActiveDay((prev) => (prev > dayIndex ? prev - 1 : Math.max(0, prev - 1)));
  };

  const handleAddActivity = () => {
    setActividades([
      ...actividades,
      { id: Date.now().toString(), dayIndex: activeDay, nombre: '', descripcion: '', direccion: '' },
    ]);
  };

  const updateActivity = (id: string, field: keyof ActivityDraft, value: string | number) => {
    setActividades(actividades.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleBuscarCoordenadas = async (actId: string, direccion: string) => {
    if (!direccion.trim()) return;
    setSearchingCoordsId(actId);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`,
        {
          headers: {
            'User-Agent': 'BitAcoraApp/1.0', // Idealmente pon un correo de contacto aquí
            'Accept-Language': 'es'
          }
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setActividades(prev => prev.map(a => a.id === actId ? { ...a, latitud: parseFloat(lat), longitud: parseFloat(lon) } : a));
      } else {
        alert('No se encontraron coordenadas para esta dirección.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al buscar coordenadas.');
    } finally {
      setSearchingCoordsId(null);
    }
  };

  const deleteActivity = (id: string) => {
    const act = actividades.find((a) => a.id === id);
    if (act?.isFromServer) {
      actividadService.delete(id).catch((err) => console.error('Error al eliminar actividad:', err));
    }
    setActividades(actividades.filter((a) => a.id !== id));
  };

  const subirPortadaSiCorresponde = async (itinerarioId: string) => {
    if (!archivoPortada) return;
    const actualizado = await itinerarioService.uploadPortada(itinerarioId, archivoPortada);
    setPortadaUrlServidor(actualizado.portadaUrl);
  };

  const handleGuardar = async () => {
    if (!titulo || !presupuesto) {
      alert('Por favor, ingrese un título y un presupuesto.');
      return;
    }

    if (!user) {
      alert('Debe iniciar sesión para crear un itinerario.');
      return;
    }

    setLoading(true);
    try {
      const baseDate = new Date(fechaInicio + 'T12:00:00Z'); // Adding time to avoid timezone offset issues
      const end = new Date(baseDate);
      end.setDate(baseDate.getDate() + numDays - 1);

      if (editId) {
        await itinerarioService.update(editId, {
          destino: titulo,
          fechaFin: end.toISOString().split('T')[0],
          presupuesto: parseFloat(presupuesto),
          notas: descripcion,
          esPublico,
        });

        for (const act of actividades) {
          if (!act.nombre) continue;
          if (act.isFromServer) {
            await actividadService.update(act.id, {
              nombre: act.nombre,
              descripcion: act.descripcion,
              direccion: act.direccion,
              latitud: act.latitud,
              longitud: act.longitud,
            });
          } else {
            const actDate = new Date(baseDate);
            actDate.setDate(baseDate.getDate() + act.dayIndex);
            await actividadService.create({
              itinerarioId: editId,
              nombre: act.nombre,
              descripcion: act.descripcion,
              direccion: act.direccion,
              latitud: act.latitud,
              longitud: act.longitud,
              fecha: actDate.toISOString(),
            });
          }
        }

        await subirPortadaSiCorresponde(editId);
        navigate('/itinerarios');
      } else {
        const endCreate = new Date(baseDate);
        endCreate.setDate(baseDate.getDate() + numDays - 1);

        const newItinerario = await itinerarioService.create({
          usuarioId: user.id,
          destino: titulo,
          fechaInicio: baseDate.toISOString().split('T')[0],
          fechaFin: endCreate.toISOString().split('T')[0],
          presupuesto: parseFloat(presupuesto),
          notas: descripcion,
          esPublico,
        });

        if (newItinerario?.id) {
          for (const act of actividades) {
            if (!act.nombre) continue;
            const actDate = new Date(baseDate);
            actDate.setDate(baseDate.getDate() + act.dayIndex);

            await actividadService.create({
              itinerarioId: newItinerario.id,
              nombre: act.nombre,
              descripcion: act.descripcion,
              direccion: act.direccion,
              latitud: act.latitud,
              longitud: act.longitud,
              fecha: actDate.toISOString(),
            });
          }

          await subirPortadaSiCorresponde(newItinerario.id);
          navigate('/itinerarios');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error al guardar el itinerario');
    } finally {
      setLoading(false);
    }
  };

  const dayActivities = actividades.filter((a) => a.dayIndex === activeDay);
  const actividadesConContenido = actividades.filter(
    (a) => a.nombre.trim() || a.descripcion.trim()
  );
  const portadaMostrada =
    portadaPreview || getPortadaUrl(portadaUrlServidor);

  if (loadingData) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Cargando datos del itinerario...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
        >
          <FiArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {editId ? 'Editar itinerario' : 'Crear itinerario'}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Ingrese titulo del itinerario"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full text-4xl font-bold text-gray-800 placeholder-gray-400 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none mb-6 pb-2"
          />

          <textarea
            placeholder="Ingrese una descripción..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full h-32 bg-gray-100 rounded-xl p-4 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-8"
          />

          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Fecha de Inicio del Viaje
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 font-medium"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800">Actividades</h2>
              <button
                onClick={handleAddActivity}
                className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600 transition shadow-sm"
              >
                <FiPlus size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddDay}
                className="text-sm text-blue-500 font-semibold hover:underline"
              >
                + Añadir día
              </button>
              <button
                onClick={handleRemoveDay}
                disabled={numDays <= 1}
                className="text-sm text-red-500 font-semibold hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                − Quitar día
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {Array.from({ length: numDays }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition ${activeDay === idx
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Día {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {dayActivities.length === 0 && (
              <p className="text-gray-500 italic">
                No hay actividades para este día. Agrega una con el botón +.
              </p>
            )}
            {dayActivities.map((act) => (
              <div
                key={act.id}
                className="flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    placeholder="Ingrese el nombre del lugar"
                    value={act.nombre}
                    onChange={(e) => updateActivity(act.id, 'nombre', e.target.value)}
                    className="w-full text-lg font-bold text-gray-800 placeholder-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Actividad a realizar"
                    value={act.descripcion}
                    onChange={(e) => updateActivity(act.id, 'descripcion', e.target.value)}
                    className="w-full text-gray-600 placeholder-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Dirección (Opcional)"
                      value={act.direccion || ''}
                      onChange={(e) => updateActivity(act.id, 'direccion', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarCoordenadas(act.id, act.direccion || '');
                        }
                      }}
                      className="flex-1 text-sm text-gray-600 placeholder-gray-400 bg-transparent border-b border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:outline-none py-1"
                    />
                    <button
                      onClick={() => handleBuscarCoordenadas(act.id, act.direccion || '')}
                      disabled={!act.direccion?.trim() || searchingCoordsId === act.id}
                      className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium text-xs rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-100"
                    >
                      {searchingCoordsId === act.id ? 'Buscando...' : 'Buscar coords'}
                    </button>
                  </div>
                  {act.latitud && act.longitud && (
                    <p className="text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-1 rounded">
                      ✓ Ubicación: {act.latitud.toFixed(4)}, {act.longitud.toFixed(4)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteActivity(act.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Resumen de actividades
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Vista general de todo el itinerario. Haz clic en un día para editarlo.
            </p>

            {actividadesConContenido.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Aún no hay actividades registradas en ningún día.
              </p>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: numDays }, (_, dayIdx) => {
                  const actsDelDia = actividades.filter(
                    (a) =>
                      a.dayIndex === dayIdx &&
                      (a.nombre.trim() || a.descripcion.trim())
                  );

                  return (
                    <div
                      key={dayIdx}
                      className={`rounded-lg border p-4 transition ${activeDay === dayIdx
                        ? 'border-blue-400 bg-blue-50/50'
                        : 'border-gray-200 bg-white'
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveDay(dayIdx)}
                        className="flex items-center justify-between w-full text-left mb-2"
                      >
                        <span className="font-semibold text-gray-800">
                          Día {dayIdx + 1}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {actsDelDia.length}{' '}
                          {actsDelDia.length === 1 ? 'actividad' : 'actividades'}
                        </span>
                      </button>

                      {actsDelDia.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">Sin actividades</p>
                      ) : (
                        <ul className="space-y-2">
                          {actsDelDia.map((act) => (
                            <li
                              key={act.id}
                              className="text-sm border-l-2 border-blue-300 pl-3"
                            >
                              <p className="font-medium text-gray-800">
                                {act.nombre.trim() || 'Sin nombre'}
                              </p>
                              {act.descripcion.trim() && (
                                <p className="text-gray-500">{act.descripcion}</p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col gap-8">
          <div className="bg-gray-200 rounded-3xl h-64 flex items-center justify-center relative overflow-hidden shadow-inner">
            {portadaMostrada && (
              <img
                src={portadaMostrada}
                alt="Portada del itinerario"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <label className="w-16 h-16 bg-white/70 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:scale-110 transition cursor-pointer z-10">
              <FiPlus size={32} />
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {(portadaMostrada || archivoPortada) && (
            <div className="flex justify-end -mt-4">
              <button
                onClick={handleRemoveImage}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Quitar portada seleccionada
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Visibilidad</h2>
            <p className="text-sm text-gray-500 mb-4">
              Los itinerarios públicos pueden aparecer en la pantalla de Inicio para otros
              viajeros.
            </p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="visibilidad"
                  checked={esPublico}
                  onChange={() => setEsPublico(true)}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-gray-800">Público</span>
                  <p className="text-sm text-gray-500">
                    Visible en Inicio y recomendaciones de la comunidad.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="visibilidad"
                  checked={!esPublico}
                  onChange={() => setEsPublico(false)}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold text-gray-800">Privado</span>
                  <p className="text-sm text-gray-500">
                    Solo tú puedes ver y editar este itinerario.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Finanzas</h2>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">Presupuesto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="Ingrese su presupuesto"
                  value={presupuesto}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < 0) return;
                    setPresupuesto(e.target.value);
                  }}
                  className="w-full bg-gray-100 text-gray-800 font-semibold py-3 pl-8 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGuardar}
            disabled={loading}
            className="w-full bg-blue-500 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-600 transition shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : editId ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearItinerario;
