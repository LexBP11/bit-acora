import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import AlertaToast from '../../components/AlertaToast';

// Importaciones de la arquitectura de tu equipo
import { usuarioService } from '../../services/usuarioService';
import type { UpdatePerfilPayload } from '../../interfaces';
import { getAvatarUrl } from '../../utils/imagenHelper';

const EditarPerfil = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Referencia para el input oculto de la foto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [destinos, setDestinos] = useState<string[]>([]);
  const [presupuesto, setPresupuesto] = useState<number | ''>('');
  
  // Estados para Contraseñas
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  
  // Estados para mostrar/ocultar texto de contraseñas (Ojitos)
  const [showPasswordActual, setShowPasswordActual] = useState(false);
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  
  // Estados de Interfaz
  const [loading, setLoading] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error', mensaje: string } | null>(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  const opcionesInteres = ["Gastronomia", "Cultura e historia", "Naturaleza y paisajes", "Aventura y deporte", "Relajación y bienestar", "Entretenimiento", "Compras", "Familiar"];

  // Precargar los datos del usuario logueado
  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setDestinos(user.destinosInteres || []);
      setPresupuesto(user.presupuestoPerfil || '');
    }
  }, [user]);

  const toggleDestino = (destino: string) => {
    if (destinos.includes(destino)) {
      setDestinos(destinos.filter(d => d !== destino));
    } else {
      setDestinos([...destinos, destino]);
    }
  };

  // 1. GUARDAR CAMBIOS (Nombre, Destinos y/o Contraseña)
  const handleGuardarCambios = async () => {
    if (!nombre.trim()) {
      mostrarAlerta('error', 'El nombre de usuario no puede estar vacío');
      return;
    }

    // Estructura bajo la interfaz estricta que creó tu equipo
    const payload: UpdatePerfilPayload = {
      nombreUsuario: nombre,
      destinosInteres: destinos,
      presupuestoPerfil: typeof presupuesto === 'number' ? presupuesto : undefined
    };

    // Validaciones si se intenta cambiar la contraseña
    if (passwordActual || nuevaPassword) {
      if (!passwordActual || !nuevaPassword) {
        mostrarAlerta('error', 'Para cambiar la contraseña, debes llenar ambos campos');
        return;
      }
      if (nuevaPassword.length < 8) {
        mostrarAlerta('error', 'La nueva contraseña debe tener mínimo 8 caracteres');
        return;
      }
      const caracteresEspeciales = nuevaPassword.match(/[^a-zA-Z0-9]/g);
      if (!caracteresEspeciales || caracteresEspeciales.length < 2) {
        mostrarAlerta('error', 'La nueva contraseña debe incluir al menos 2 caracteres especiales');
        return;
      }
      
      payload.contrasenaActual = passwordActual;
      payload.nuevaContrasena = nuevaPassword;
    }

    setLoading(true);
    try {
      // Petición usando el servicio unificado
      const usuarioActualizado = await usuarioService.updatePerfil(payload);
      
      const token = localStorage.getItem('token');
      login(token!, JSON.stringify(usuarioActualizado));
      
      mostrarAlerta('exito', '¡Perfil actualizado correctamente!');
      setPasswordActual('');
      setNuevaPassword('');
      setTimeout(() => navigate('/perfil'), 2000);
      
    } catch (error: any) {
      mostrarAlerta('error', error?.response?.data?.message || 'Contraseña actual incorrecta o error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  // 2. ELIMINAR CUENTA (Borrado lógico)
  const handleEliminarCuenta = async () => {
    setLoading(true);
    try {
      await usuarioService.deletePerfil();
      mostrarAlerta('exito', 'Cuenta eliminada. Lamentamos verte partir.');
      setShowModalEliminar(false);
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2500);
    } catch (error) {
      mostrarAlerta('error', 'Error al intentar eliminar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  // 3. SUBIR FOTO DE PERFIL (AVATAR)
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      mostrarAlerta('error', 'La imagen es muy pesada. Máximo 5MB.');
      return;
    }

    setLoading(true);
    try {
      const usuarioActualizado = await usuarioService.uploadAvatar(file);
      const token = localStorage.getItem('token');
      login(token!, JSON.stringify(usuarioActualizado));
      mostrarAlerta('exito', '¡Foto de perfil actualizada!');
    } catch (error) {
      mostrarAlerta('error', 'No se pudo subir la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (tipo: 'exito' | 'error', mensaje: string) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 5000);
  };

  const inicialNombre = user?.nombre ? user.nombre.charAt(0).toUpperCase() : '?';

  const avatarSrc = getAvatarUrl(user?.avatarUrl);

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans relative">
      {alerta && <AlertaToast tipo={alerta.tipo} mensaje={alerta.mensaje} />}

      {/* Encabezado */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/perfil" className="text-gray-600 hover:text-black transition">
          <FiArrowLeft size={28} />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Editar perfil</h1>
      </div>

      <div className="flex flex-col items-center">
        
        {/* Foto de Perfil / Avatar */}
        <div className="relative mb-10">
          <div className="w-32 h-32 rounded-full bg-[#64979E] text-white flex items-center justify-center text-5xl font-bold shadow-md overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              inicialNombre
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg" 
            ref={fileInputRef} 
            onChange={handleAvatarChange}
            className="hidden" 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition border border-gray-200 disabled:opacity-50"
          >
            <FiCamera size={20} />
          </button>
        </div>

        {/* CONTENEDOR PRINCIPAL DEL FORMULARIO */}
        <div className="w-full bg-[#E5E7EB] rounded-2xl p-8 shadow-inner">
          
          {/* Nombre de Usuario */}
          <div className="mb-6">
            <label className="block text-[#305973] font-medium mb-2 ml-1">Nombre de usuario</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
            />
          </div>

          {/* Lugares de Interés (Checkboxes) */}
          <div className="mb-8">
            <label className="block text-[#305973] font-medium mb-3 ml-1">Lugares de interes</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opcionesInteres.map((opcion) => (
                <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={destinos.includes(opcion)}
                    onChange={() => toggleDestino(opcion)}
                    className="w-5 h-5 rounded border-gray-400 text-blue-500 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-black transition">{opcion}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-gray-300 mb-6" />

          {/* Presupuesto */}
          <div className="mb-8">
            <label className="block text-[#305973] font-medium mb-2 ml-1">Presupuesto ideal para tu viaje ($)</label>
            <input 
              type="number" 
              value={presupuesto}
              onChange={(e) => setPresupuesto(Number(e.target.value) || '')}
              min="0"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all"
              placeholder="Ej. 1500"
            />
          </div>

          <hr className="border-gray-300 mb-6" />

          {/* Sección de Contraseñas */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#305973] mb-4">Actualizar contraseña</h3>
            
            {/* Contraseña Actual */}
            <div className="mb-4">
              <label className="block text-[#597B92] font-medium mb-2 ml-1">Contraseña actual</label>
              <div className="relative">
                <input 
                  type={showPasswordActual ? "text" : "password"} 
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all pr-12"
                  placeholder="Solo llénalo si deseas cambiar tu contraseña"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPasswordActual(!showPasswordActual)} 
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswordActual ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Nueva Contraseña */}
            <div>
              <label className="block text-[#597B92] font-medium mb-2 ml-1">Nueva contraseña</label>
              <div className="relative">
                <input 
                  type={showNuevaPassword ? "text" : "password"} 
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none border-2 border-transparent focus:border-green-400 transition-all pr-12"
                  placeholder="Escribe tu nueva contraseña"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNuevaPassword(!showNuevaPassword)} 
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNuevaPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 ml-1">Mínimo 8 caracteres con al menos 2 caracteres especiales.</p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-between items-center mt-10">
            <button 
              type="button"
              onClick={() => setShowModalEliminar(true)}
              className="bg-[#EF4444] text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition shadow-md"
            >
              Eliminar cuenta
            </button>

            <button 
              type="button"
              onClick={handleGuardarCambios}
              disabled={loading}
              className="bg-[#1E88E5] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition shadow-md disabled:opacity-70"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>

        </div>
      </div>

      {/* Modal de confirmación para borrado de cuenta */}
      {showModalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border border-red-100">
            <h2 className="text-2xl font-bold text-red-600 mb-2">¿Estás completamente seguro?</h2>
            <p className="text-gray-600 mb-8">
              Esta acción es irreversible. Se borrarán todos tus itinerarios, configuraciones y datos de la plataforma.
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowModalEliminar(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleEliminarCuenta}
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-md"
              >
                Sí, eliminar mi cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPerfil;