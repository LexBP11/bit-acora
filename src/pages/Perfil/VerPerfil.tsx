import React from 'react';
import { Link } from 'react-router-dom';
import { FiEdit3, FiMail, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const VerPerfil = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-10">
        <p className="text-xl text-gray-500 font-semibold animate-pulse">Cargando tu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-10">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm text-center">
          <p className="font-semibold text-lg mb-2">Algo salió mal</p>
          <p className="text-sm">No se pudo cargar la información del usuario.</p>
        </div>
      </div>
    );
  }

  const inicialNombre = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      
      {/* Título de la sección */}
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

      {/* Contenedor Principal tipo Tarjeta */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* BANNER DE PORTADA (Degradado atractivo) */}
        <div className="h-48 w-full bg-gradient-to-r from-[#64979E] to-[#305973]"></div>

        <div className="px-10 pb-10 relative flex flex-col items-center">
          
          {/* AVATAR SUPERPUESTO */}
          {/* Usamos -mt-20 para subirlo y ring-4 para darle el borde blanco */}
          <div className="-mt-20 w-40 h-40 rounded-full bg-[#E4E9EC] text-[#305973] border-4 border-white flex items-center justify-center text-6xl font-bold shadow-md z-10">
            {inicialNombre}
          </div>

          {/* NOMBRE E INFO BÁSICA CENTRAL */}
          <div className="mt-4 text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{user.nombre}</h2>
            <div className="flex items-center justify-center gap-2 text-gray-500 mt-2">
              <FiMail size={16} />
              <span>{user.email}</span>
            </div>
          </div>

          {/* SECCIÓN DE ETIQUETAS (Destinos de Interés) */}
          <div className="w-full bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FiMapPin className="text-[#64979E]" />
              Lugares de Interés
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {/* Si el usuario tiene destinos, los mostramos como etiquetas azules */}
              {user.destinosInteres && user.destinosInteres.length > 0 ? (
                user.destinosInteres.map((destino, index) => (
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
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerPerfil;