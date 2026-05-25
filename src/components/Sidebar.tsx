import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBox, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import logoImagen from '../assets/logo.jpg';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-gray-100 min-h-screen flex flex-col p-6 shadow-lg">
      {/* Logo */}
      <div className="mb-8 flex justify-center">
        <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
          <img 
            src={logoImagen} 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Botón Crear Itinerario */}
      <Link
        to="/itinerarios/crear"
        className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition mb-8 text-center"
      >
        Crear un itinerario
      </Link>

      {/* Navegación */}
      <nav className="flex-1 space-y-2">
        {/* Inicio */}
        <Link
          to="/home"
          className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
            isActive('/home')
              ? 'bg-gray-300 text-gray-900 font-semibold'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiHome size={24} />
          <span className="text-lg">Inicio</span>
        </Link>

        {/* Itinerarios */}
        <Link
          to="/itinerarios"
          className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
            isActive('/itinerarios')
              ? 'bg-gray-300 text-gray-900 font-semibold'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiBox size={24} />
          <span className="text-lg">Itinerarios</span>
        </Link>

        {/* Perfil */}
        <Link
          to="/perfil"
          className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
            isActive('/perfil')
              ? 'bg-gray-300 text-gray-900 font-semibold'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FiUser size={24} />
          <span className="text-lg">Perfil</span>
        </Link>
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition w-full font-semibold"
      >
        <FiLogOut size={24} />
        <span>Cerrar sesión</span>
      </button>
    </div>
  );
};

export default Sidebar;
