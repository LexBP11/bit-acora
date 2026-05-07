import api from '../api/axiosConfig';
import type { Usuario } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const usuarioService = {
  registro: async (data: Partial<Usuario> & { contraseña?: string }): Promise<{ token: string; user: Usuario }> => {
    try {
      const response = await api.post('/usuarios/registro', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  login: async (credentials: { email: string; contraseña?: string; password?: string }): Promise<{ token: string; user?: Usuario }> => {
    try {
      // El doc.back dice que recibe "contraseña", pero enviamos ambas para retrocompatibilidad
      const response = await api.post('/usuarios/login', credentials);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getPerfil: async (): Promise<Usuario> => {
    try {
      const response = await api.get('/usuarios/perfil');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updatePerfil: async (data: Partial<Usuario> & { contraseña?: string }): Promise<Usuario> => {
    try {
      const response = await api.put('/usuarios/perfil', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
