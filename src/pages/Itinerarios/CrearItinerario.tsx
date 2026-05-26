import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { itinerarioService } from '../../services/itinerarioService';
import { actividadService } from '../../services/actividadService';
import { useAuth } from '../../contexts/AuthContext';
import { fileToBase64, guardarImagenes, obtenerImagenes } from '../../utils/imageStorage';

interface ActivityDraft {
  id: string;
  dayIndex: number;
  nombre: string;
  descripcion: string;
  isFromServer?: boolean; // para saber si ya existe en el backend
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
    { id: '1', dayIndex: 0, nombre: '', descripcion: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [fechaInicioOriginal, setFechaInicioOriginal] = useState<string | null>(null);

  // Cargar datos existentes si estamos en modo edición
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
          setFechaInicioOriginal(data.fechaInicio);
          
          // Calcular número de días
          if (data.fechaInicio && data.fechaFin) {
            const diff = Math.ceil(
              (new Date(data.fechaFin).getTime() - new Date(data.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)
            );
            setNumDays(diff > 0 ? diff + 1 : 3);
          }
          
          // Cargar actividades existentes agrupadas por día
          if (data.actividades && data.actividades.length > 0) {
            const startDate = new Date(data.fechaInicio);
            const mapped: ActivityDraft[] = data.actividades.map(act => {
              let dayIndex = 0;
              if (act.fecha && data.fechaInicio) {
                const actDate = new Date(act.fecha.split('T')[0]);
                const startD = new Date(data.fechaInicio.split('T')[0]);
                dayIndex = Math.floor((actDate.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
                if (dayIndex < 0) dayIndex = 0;
              }
              return {
                id: act.id,
                dayIndex,
                nombre: act.nombre,
                descripcion: act.descripcion || '',
                isFromServer: true,
              };
            });
            setActividades(mapped);
          } else {
            setActividades([]);
          }
          
          // Cargar imágenes guardadas en localStorage
          const savedImgs = obtenerImagenes(editId);
          if (savedImgs) {
            setImagenes(savedImgs);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setImagenes(prev => [...prev, base64]);
      } catch (err) {
        console.error('Error al cargar imagen:', err);
      }
    }
  };

  const handleRemoveImage = () => {
    if (imagenes.length > 0) {
      setImagenes(prev => prev.filter((_, i) => i !== imageIndex));
      setImageIndex(0);
    }
  };

  const handleImageNext = () => {
    if (imagenes.length > 1) {
      setImageIndex(prev => (prev + 1) % imagenes.length);
    }
  };

  const handleImagePrev = () => {
    if (imagenes.length > 1) {
      setImageIndex(prev => (prev === 0 ? imagenes.length - 1 : prev - 1));
    }
  };

  const handleAddDay = () => {
    setNumDays(prev => prev + 1);
  };

  const handleAddActivity = () => {
    setActividades([
      ...actividades,
      { id: Date.now().toString(), dayIndex: activeDay, nombre: '', descripcion: '' }
    ]);
  };

  const updateActivity = (id: string, field: keyof ActivityDraft, value: string) => {
    setActividades(actividades.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const deleteActivity = (id: string) => {
    const act = actividades.find(a => a.id === id);
    // Si es una actividad del servidor, eliminarla también del backend
    if (act?.isFromServer) {
      actividadService.delete(id).catch(err => console.error('Error al eliminar actividad:', err));
    }
    setActividades(actividades.filter(a => a.id !== id));
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
      const baseDate = fechaInicioOriginal ? new Date(fechaInicioOriginal) : new Date();
      const end = new Date(baseDate);
      end.setDate(baseDate.getDate() + numDays - 1);

      if (editId) {
        // --- MODO EDICIÓN ---
        await itinerarioService.update(editId, {
          destino: titulo,
          fechaFin: end.toISOString().split('T')[0],
          presupuesto: parseFloat(presupuesto),
          notas: descripcion,
        });

        // Guardar actividades nuevas (las que no vienen del servidor)
        for (const act of actividades) {
          if (!act.nombre) continue;
          if (act.isFromServer) {
            // Actualizar actividad existente
            await actividadService.update(act.id, {
              nombre: act.nombre,
              descripcion: act.descripcion,
            });
          } else {
            // Crear actividad nueva
            const actDate = new Date(baseDate);
            actDate.setDate(baseDate.getDate() + act.dayIndex);
            await actividadService.create({
              itinerarioId: editId,
              nombre: act.nombre,
              descripcion: act.descripcion,
              fecha: actDate.toISOString(),
            });
          }
        }
        
        // Guardar imágenes en localStorage
        guardarImagenes(editId, imagenes);
        
        navigate('/itinerarios');
      } else {
        // --- MODO CREACIÓN ---
        const today = new Date();
        const endCreate = new Date();
        endCreate.setDate(today.getDate() + numDays - 1);

        const newItinerario = await itinerarioService.create({
          usuarioId: user.id,
          destino: titulo,
          fechaInicio: today.toISOString().split('T')[0],
          fechaFin: endCreate.toISOString().split('T')[0],
          presupuesto: parseFloat(presupuesto),
          notas: descripcion,
          esPublico: true
        });
        
        if (newItinerario && newItinerario.id) {
          for (const act of actividades) {
            if (!act.nombre) continue;
            const actDate = new Date(today);
            actDate.setDate(today.getDate() + act.dayIndex);
            
            await actividadService.create({
              itinerarioId: newItinerario.id,
              nombre: act.nombre,
              descripcion: act.descripcion,
              fecha: actDate.toISOString()
            });
          }
          
          // Guardar imágenes en localStorage
          if (imagenes.length > 0) {
            guardarImagenes(newItinerario.id, imagenes);
          }
          
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

  const dayActivities = actividades.filter(a => a.dayIndex === activeDay);

  if (loadingData) {
    return (
      <div className="p-8 flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Cargando datos del itinerario...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-screen overflow-y-auto">
      {/* Header */}
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
        {/* Left Column */}
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
            <button 
              onClick={handleAddDay}
              className="text-sm text-blue-500 font-semibold hover:underline"
            >
              + Añadir día
            </button>
          </div>

          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {Array.from({ length: numDays }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDay(idx)}
                className={`whitespace-nowrap px-6 py-2 rounded-full font-semibold transition ${
                  activeDay === idx 
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
              <p className="text-gray-500 italic">No hay actividades para este día. Agrega una con el botón +.</p>
            )}
            {dayActivities.map(act => (
              <div key={act.id} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
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
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => deleteActivity(act.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-1/3 flex flex-col gap-8">
          {/* Image Gallery */}
          <div className="bg-gray-200 rounded-3xl h-64 flex items-center justify-between px-4 relative overflow-hidden shadow-inner group">
            {imagenes.length > 0 && (
              <img src={imagenes[imageIndex]} alt="Destino" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {imagenes.length > 1 && (
              <button 
                onClick={handleImagePrev}
                className="w-10 h-10 bg-white/50 hover:bg-white flex items-center justify-center rounded-full text-gray-700 transition z-10"
              >
                <FiChevronLeft size={24} />
              </button>
            )}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <label className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center text-gray-600 hover:bg-white hover:scale-110 transition cursor-pointer">
                <FiPlus size={32} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            {imagenes.length > 1 && (
              <button 
                onClick={handleImageNext}
                className="w-10 h-10 bg-white/50 hover:bg-white flex items-center justify-center rounded-full text-gray-700 transition z-10"
              >
                <FiChevronRight size={24} />
              </button>
            )}
          </div>
          {/* Image indicators & remove */}
          {imagenes.length > 0 && (
            <div className="flex items-center justify-between -mt-4">
              <div className="flex gap-2">
                {imagenes.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition cursor-pointer ${
                      i === imageIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setImageIndex(i)}
                  />
                ))}
              </div>
              <button
                onClick={handleRemoveImage}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Quitar imagen
              </button>
            </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Finanzas</h2>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">Presupuesto</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
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
            {loading ? 'Guardando...' : (editId ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearItinerario;
