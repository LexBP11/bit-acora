import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Placeholders para las páginas (Rutas Públicas)
const Login = () => <div className="p-4">Página de Login</div>;
const Registro = () => <div className="p-4">Página de Registro</div>;

// Placeholders para las páginas (Rutas Protegidas)
const Dashboard = () => <div className="p-4">Página de Dashboard</div>;
const ItinerarioDetail = () => <div className="p-4">Detalle del Itinerario</div>;
const Perfil = () => <div className="p-4">Página de Perfil</div>;
const Gastos = () => <div className="p-4">Gestión de Gastos</div>;

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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/itinerario/:id" element={<ItinerarioDetail />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/gastos/:itinerarioId" element={<Gastos />} />
          </Route>

          {/* Redirección por defecto: si no existe la ruta, redirige a login o dashboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
