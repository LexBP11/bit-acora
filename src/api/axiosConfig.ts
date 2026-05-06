import axios from 'axios';

// Usamos import.meta.env en Vite para acceder a variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones: agrega el Token JWT si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: maneja errores globales, como el 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expiró o es inválido, limpiamos el local storage y redirigimos
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // En una app de React Router podemos usar window.location o un manejador de eventos global
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
