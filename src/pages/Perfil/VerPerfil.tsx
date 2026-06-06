import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiMail, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { usuarioService } from '../../services/usuarioService';
import type { Usuario } from '../../interfaces';

const VerPerfil = () => {
  const { isLoading: authLoading, login } = useAuth();
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError(null);
        const data = await usuarioService.getPerfil();
        setProfile(data);

        const token = localStorage.getItem('token');
        if (token) {
          login(token, JSON.stringify(data));
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('No se pudo cargar la información del perfil');
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [authLoading, login]);

  if (authLoading || loadingProfile) {
    return (
      <div className="h-full flex items-center justify-center p-10">
        <p className="text-xl text-gray-500 font-semibold animate-pulse">Cargando tu perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-full flex items-center justify-center p-10">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm text-center">
          <p className="font-semibold text-lg mb-2">Ups, algo salió mal</p>
          <p className="text-sm">{error || 'No se pudo cargar la información del usuario.'}</p>
        </div>
      </div>
    );
  }

  const displayUser = profile;
  const inicialNombre = displayUser.nombre ? displayUser.nombre.charAt(0).toUpperCase() : '?';

  const serverBase = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:3000';
  const avatarSrc = displayUser.avatarUrl ? `${serverBase}${displayUser.avatarUrl}` : null;

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Mi Perfil</h1>
        <Link
          to="/perfil/editar"
          className="bg-[#1E88E5] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition shadow-md font-medium"
        >
          <FiEdit3 size={18} />
          Editar Perfil
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">

        <div className="h-48 w-full bg-gradient-to-r from-[#64979E] to-[#305973]"></div>

        <div className="px-10 pb-10 relative flex flex-col items-center">

          <div className="-mt-20 w-40 h-40 rounded-full bg-[#E4E9EC] text-[#305973] border-4 border-white flex items-center justify-center text-6xl font-bold shadow-md z-10 overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt="Avatar de perfil" className="w-full h-full object-cover" />
            ) : (
              inicialNombre
            )}
          </div>

          <div className="mt-4 text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{displayUser.nombre}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-500 mt-2">
              <FiMail size={16} />
              <span>{displayUser.email}</span>
            </div>
          </div>

          <div className="w-full bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FiMapPin className="text-[#64979E]" />
              Lugares de Interés
            </h3>

            <div className="flex flex-wrap gap-3 mb-6">
              {displayUser.destinosInteres && displayUser.destinosInteres.length > 0 ? (
                displayUser.destinosInteres.map((destino, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-[#1E88E5] rounded-full text-sm font-medium border border-blue-100"
                  >
                    {destino}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">Aún no has seleccionado tus lugares de interés.</p>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="text-[#64979E]">💰</span>
              Presupuesto Ideal
            </h3>
            <div>
              {displayUser.presupuestoPerfil ? (
                <p className="text-gray-800 text-xl font-bold">${displayUser.presupuestoPerfil}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">No has definido un presupuesto ideal.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerPerfil;
