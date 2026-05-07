import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Páginas (Rutas Públicas)
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';

// Páginas (Rutas Protegidas)
import Home from './pages/Home/Home';
import TestPreferencias from './pages/Preferencias/TestPreferencias';
import MisItinerarios from './pages/Itinerarios/MisItinerarios';
import CrearItinerario from './pages/Itinerarios/CrearItinerario';
import VerItinerario from './pages/Itinerarios/VerItinerario';
import DetalleItinerario from './pages/Itinerarios/DetalleItinerario';
import Finanzas from './pages/Finanzas/Finanzas';
import VerPerfil from './pages/Perfil/VerPerfil';
import EditarPerfil from './pages/Perfil/EditarPerfil';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/preferencias" element={<TestPreferencias />} />
            <Route path="/home" element={<Home />} />
            <Route path="/itinerarios" element={<MisItinerarios />} />
            <Route path="/itinerarios/crear" element={<CrearItinerario />} />
            <Route path="/itinerarios/:id/dias" element={<VerItinerario />} />
            <Route path="/itinerarios/:id/detalle" element={<DetalleItinerario />} />
            <Route path="/itinerarios/:id/finanzas" element={<Finanzas />} />
            <Route path="/perfil" element={<VerPerfil />} />
            <Route path="/perfil/editar" element={<EditarPerfil />} />
            
            {/* Redirección para el dashboard anterior */}
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
