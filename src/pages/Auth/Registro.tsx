import React, { useEffect, useState } from 'react';
import { useRegistro } from '../../hooks/useRegistro';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import AlertaToast from '../../components/AlertaToast';
import logoImagen from '../../assets/logo.jpg';

const Registro = () => {
  //Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //Estados para la pantalla
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [erroresCampos, setErroresCampos] = useState({ nombre: '', email: '', password: '', confirmPassword: ''});

  //Estados para la ventana emergente
  const [showModal, setShowModal] = useState(false);
  const [destinosInteres, setDestinosInteres] = useState<string[]>([]);
  const opcionesInteres = ["Gastronomia", "Cultura e historia", "Naturaleza y paisajes", "Aventura y deporte", "Relajación y bienestar", "Entretenimiento", "Compras", "Familiar"];

  //Estado para la alerta emergente
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error', mensaje: string} | null>(null);

  //Hook para el registro de un usuario
  const { register, loading, error: apiError } = useRegistro();

  //Hooks para redirección y sesión global
  const navigate = useNavigate();
  const { login } = useAuth();

  //Alertas
  useEffect(() => {
    if (apiError) {
      setAlerta({ tipo: 'error', mensaje: apiError });
      const timer = setTimeout(() => setAlerta(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const toggleDestino = (destino: string) => {
    if (destinosInteres.includes(destino)) {
      setDestinosInteres(destinosInteres.filter(d => d !== destino));
    } else {
      setDestinosInteres([...destinosInteres, destino]);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    let hayErrores = false;
    const nuevosErrores = {nombre: '', email: '', password: '', confirmPassword: ''};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de usuario es obligatorio';
      hayErrores = true;
    }

    if (!email.trim()) {
      nuevosErrores.email = 'El correo electrónico es obligatorio';
      hayErrores = true;
    } else if (!/^[^\s@]+@[^\s@]+\.com$/.test(email)) {
      nuevosErrores.email = 'El correo debe tener un formato válido';
      hayErrores = true;
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatorio';
      hayErrores = true;
    } else if (password.length < 8) {
      nuevosErrores.password = 'Mínimo 8 caracteres';
      hayErrores = true;
    } else {
      const caracteresEspeciales = password.match(/[^a-zA-Z0-9]/g);
      if (!caracteresEspeciales || caracteresEspeciales.length < 2) {
        nuevosErrores.password = 'Debe incluir al menos 2 caracteres especiales';
        hayErrores = true;
      }
    }

    if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = 'Las constraseñas no coinciden';
      hayErrores = true;
    }
    
    setErroresCampos(nuevosErrores);
    if (hayErrores) return;


    try {
      const respuesta = await register({ 
        nombre,
        email, 
        contraseña: password,
        destinosInteres
      });
      
      console.log("Respuesta del servidor:", respuesta);

      if (respuesta && respuesta.token) {
        setAlerta({ tipo: 'exito', mensaje: 'Usuario creado con éxito Ingresando...'});
        login(respuesta.token, JSON.stringify(respuesta.user));

        setTimeout(() => {
          navigate('/home');
        }, 6000);
      }
      console.log("Usuario creado", respuesta);
    } catch (err) {
      if (!apiError) {
        setAlerta({tipo: 'error', mensaje: 'Error de conexión: No se pudo contactar con el servidor'});
        setTimeout(() => setAlerta(null), 6000);
      }
      console.log("Fallo en el registro");
    }
  };


  return (
    // CONTENEDOR PRINCIPAL: Pantalla completa, gris muy claro. 
    // Usamos 'relative' para que la ventana emergente (modal) se posicione sobre todo.
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">

      {/* ==========================================
          ALERTA EMERGENTE (TOAST NOTIFICATION COMPONENTE REUTILIZABLE)
          ========================================== */}
      {alerta && <AlertaToast tipo={alerta.tipo} mensaje={alerta.mensaje} />}
      
      {/* ==========================================
          TARJETA DE REGISTRO PRINCIPAL (Split Screen) 
          ========================================== */}
      <div className="flex w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px]">
        
        {/* COLUMNA IZQUIERDA: Zona del Logo/Visual */}
        <div className="w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8">
          <img
            src={logoImagen}
            alt="Logo de Bit-Acora"
            className="w-full max-w-sm object-contain drop-shadow-md"
          />
        </div>

        {/* COLUMNA DERECHA: Zona del Formulario */}
        <div className="w-1/2 p-10 flex flex-col justify-center">
          
          {/* TÍTULO Y SUBTÍTULO */}
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-extrabold text-[#2C4C5E] tracking-tight">Registrate</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
              Regístrate para conocer lugares y actividades de tus amigos
            </p>
          </div>

          {/* FORMULARIO: Usamos noValidate para apagar las alertas por defecto del navegador */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 flex flex-col items-center">
            
            {/* Mensaje de Error General de la API (Ej. "El correo ya existe") */}
            {apiError && (
              <div className="w-full max-w-md bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200 text-center">
                {apiError}
              </div>
            )}

            {/* Input: Nombre de usuario (Mapeado a 'nombre' en la API) */}
            <div className="w-full max-w-md">
              <input 
                type="text" 
                placeholder="Nombre de usuario" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  erroresCampos.nombre ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'
                }`} 
              />
              {/* Alerta de validación en línea (Aparece debajo del input en rojo) */}
              {erroresCampos.nombre && <p className="text-red-500 text-xs mt-1 ml-1">{erroresCampos.nombre}</p>}
            </div>

            {/* Input: Correo electrónico */}
            <div className="w-full max-w-md">
              <input 
                type="email" 
                placeholder="Correo electronico" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  erroresCampos.email ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'
                }`} 
              />
              {erroresCampos.email && <p className="text-red-500 text-xs mt-1 ml-1">{erroresCampos.email}</p>}
            </div>

            {/* Input: Contraseña con Toggle de Visibilidad */}
            <div className="w-full max-w-md relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  erroresCampos.password ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'
                }`} 
              />
              {/* Botón flotante para el icono del ojo */}
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
              {erroresCampos.password && <p className="text-red-500 text-xs mt-1 ml-1">{erroresCampos.password}</p>}
            </div>

            {/* Input: Confirmar Contraseña con Toggle */}
            <div className="w-full max-w-md relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirmar Contraseña" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-5 py-3 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  erroresCampos.confirmPassword ? 'border-red-400 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'
                }`} 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
              {erroresCampos.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-1">{erroresCampos.confirmPassword}</p>}
            </div>

            {/* Texto Informativo de Validación General */}
            <div className="w-full max-w-md text-left px-1 mt-2">
              <p className="text-xs text-blue-800">
                mínimo 8 caracteres con al menos 2 caracteres especiales.
              </p>
            </div>

            {/* BOTÓN PARA ABRIR LA VENTANA EMERGENTE (Destinos) */}
            <div className="w-full max-w-md flex justify-start px-1 mt-1">
              <button 
                type="button" 
                onClick={() => setShowModal(true)}
                className="text-sm text-[#3B96F3] font-medium hover:underline flex items-center gap-1"
              >
                + Elegir lugares de interés {destinosInteres.length > 0 && `(${destinosInteres.length})`}
              </button>
            </div>

            

            {/* Texto Legal (Términos y Condiciones) */}
            <div className="w-full max-w-md text-left px-1">
              <p className="text-xs text-gray-600">
                Al registrarte, aceptas nuestras <a href="#" className="text-blue-700 underline">Condiciones</a> y <a href="#" className="text-blue-700 underline">Política de privacidad</a>.
              </p>
            </div>
            
            {/* BOTÓN REGISTRARTE */}
            <div className="w-full max-w-md pt-4 flex justify-center">
              <button 
                type="submit" 
                disabled={loading}
                className="w-auto px-12 py-3 bg-[#3B96F3] text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition shadow-lg shadow-blue-100 disabled:opacity-70"
              >
                {loading ? 'Registrando...' : 'Registrate'}
              </button>
            </div>

            {/* ENLACE PARA INICIAR SESIÓN */}
            <div className="w-full max-w-md text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta? <Link to="/auth/login" className="font-semibold text-[#2C4C5E] hover:underline">Iniciar sesión</Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ==========================================
          VENTANA EMERGENTE (MODAL) DE DESTINOS
          ========================================== */}
      {showModal && (
        /* Fondo oscuro difuminado que bloquea el resto de la pantalla (Backdrop) */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm">
          
          {/* Contenedor gris del Modal */}
          <div className="bg-[#E4E9EC] p-10 rounded-lg shadow-2xl w-full max-w-xl relative border border-gray-200">
            
            {/* Título y Subtítulo del Modal */}
            <h2 className="text-3xl font-semibold text-[#305973] mb-1">Lugares de Interes</h2>
            <p className="text-[#597B92] text-sm mb-6">
              Ingresa los lugares de tu preferencia, puedes cambiarlos posteriormente
            </p>

            {/* Lista de Checkboxes generada dinámicamente según el arreglo 'opcionesInteres' */}
            <div className="flex flex-col gap-3 mb-8">
              {opcionesInteres.map((opcion) => (
                <label key={opcion} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={destinosInteres.includes(opcion)}
                    onChange={() => toggleDestino(opcion)}
                    className="w-5 h-5 rounded border-gray-400 text-[#1E88E5] focus:ring-[#1E88E5] cursor-pointer"
                  />
                  <span className="text-gray-800 font-medium group-hover:text-black transition">{opcion}</span>
                </label>
              ))}
            </div>

            {/* Botón Guardar (Cierra el modal y conserva los datos en el estado) */}
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="bg-[#1E88E5] text-white px-8 py-2.5 text-xl font-medium rounded hover:bg-blue-600 transition shadow-md"
              >
                Guardar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );



  


};

export default Registro;
