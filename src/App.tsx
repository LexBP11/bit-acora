import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Páginas (Rutas Públicas)
import Login from './pages/Auth/Login';
import Registro from './pages/Auth/Registro';

// Páginas (Rutas Protegidas)
import Home from './pages/Home/Home';
import MisItinerarios from './pages/Itinerarios/MisItinerarios';
import CrearItinerario from './pages/Itinerarios/CrearItinerario';
import VerItinerario from './pages/Itinerarios/VerItinerario';
import DetalleItinerario from './pages/Itinerarios/DetalleItinerario';
import Finanzas from './pages/Finanzas/Finanzas';
import VerPerfil from './pages/Perfil/VerPerfil';
import EditarPerfil from './pages/Perfil/EditarPerfil';
import DashboardReportes from './pages/Reportes/DashboardReportes';

// Layout para rutas protegidas con Sidebar
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 overflow-auto">
      {children}
    </div>
  </div>
);

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

            <Route
              path="/home"
              element={
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              }
            />
            <Route
              path="/itinerarios"
              element={
                <ProtectedLayout>
                  <MisItinerarios />
                </ProtectedLayout>
              }
            />
            <Route
              path="/itinerarios/crear"
              element={
                <ProtectedLayout>
                  <CrearItinerario />
                </ProtectedLayout>
              }
            />
            <Route
              path="/itinerarios/:id/dias"
              element={
                <ProtectedLayout>
                  <VerItinerario />
                </ProtectedLayout>
              }
            />
            <Route
              path="/itinerarios/:id/detalle"
              element={
                <ProtectedLayout>
                  <DetalleItinerario />
                </ProtectedLayout>
              }
            />
            <Route
              path="/itinerarios/:id/finanzas"
              element={
                <ProtectedLayout>
                  <Finanzas />
                </ProtectedLayout>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedLayout>
                  <VerPerfil />
                </ProtectedLayout>
              }
            />
            <Route
              path="/perfil/editar"
              element={
                <ProtectedLayout>
                  <EditarPerfil />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedLayout>
                  <DashboardReportes />
                </ProtectedLayout>
              }
            />

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
