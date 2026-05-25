import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import AlertaToast from '../../components/AlertaToast';
import logoImagen from '../../assets/logo.jpg';
import { usuarioService } from '../../services/usuarioService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({ email: '', password: '' });
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hayErrores = false;
    const nuevosErrores = { email: '', password: '' };

    if (!email.trim()) {
      nuevosErrores.email = 'El correo es obligatorio';
      hayErrores = true;
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
      nuevosErrores.email = 'Formato de correo inválido';
      hayErrores = true;
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
      hayErrores = true;
    }

    setErrores(nuevosErrores);
    if (hayErrores) return;

    try {
      setLoading(true);
      const respuesta = await usuarioService.login({ email, contraseña: password });
      
      if (respuesta && respuesta.token) {
        setAlerta({ tipo: 'exito', mensaje: 'Iniciando sesión...' });
        login(respuesta.token, JSON.stringify(respuesta.user));
        
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      }
    } catch (error: any) {
      setAlerta({
        tipo: 'error',
        mensaje: error?.message || 'Error al iniciar sesión',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      {alerta && <AlertaToast tipo={alerta.tipo} mensaje={alerta.mensaje} />}
      
      <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
        
        {/* Columna Izquierda - Logo */}
        <div className="w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8">
          <img
            src={logoImagen}
            alt="Logo de Bit-Acora"
            className="w-full max-w-sm object-contain drop-shadow-md"
          />
        </div>

        {/* Columna Derecha - Formulario */}
        <div className="w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-[#2C4C5E] tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Accede a tu cuenta para continuar con tus viajes
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4 flex flex-col items-center">
            
            {/* Input: Email */}
            <div className="w-full max-w-md">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errores.email
                    ? 'border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:ring-blue-100'
                }`}
              />
              {errores.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errores.email}</p>
              )}
            </div>

            {/* Input: Contraseña */}
            <div className="w-full max-w-md relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errores.password
                    ? 'border-red-400 focus:ring-red-100'
                    : 'border-gray-300 focus:ring-blue-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
              {errores.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errores.password}</p>
              )}
            </div>

            {/* Botón Iniciar Sesión */}
            <div className="w-full max-w-md pt-4 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-auto px-12 py-3 bg-[#3B96F3] text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-100 disabled:opacity-70"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </div>

            {/* Enlace para Registro */}
            <div className="w-full max-w-md text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/registro"
                  className="font-semibold text-[#2C4C5E] hover:underline"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
