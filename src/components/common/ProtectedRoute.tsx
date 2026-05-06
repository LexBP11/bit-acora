import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras verificamos el token contra la API (perfil), mostramos un estado de carga
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Si no está autenticado, redirigimos a la ruta especificada
    return <Navigate to={redirectPath} replace />;
  }

  // Si está autenticado, renderizamos las rutas anidadas
  return <Outlet />;
};

export default ProtectedRoute;
