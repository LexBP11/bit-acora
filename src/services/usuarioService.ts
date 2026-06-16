import api from '../api/axiosConfig';
import type { Usuario, UpdatePerfilPayload } from '../interfaces';
import { handleApiError } from '../utils/apiErrorHandler';

export const usuarioService = {
  registro: async (data: Partial<Usuario> & { contraseña?: string }): Promise<{ token: string; user: Usuario }> => {
    try {
      const response = await api.post('/usuarios/registro', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  login: async (credentials: { email: string; contraseña?: string; password?: string }): Promise<{ token: string; user?: Usuario }> => {
    try {
      // El doc.back dice que recibe "contraseña", pero enviamos ambas para retrocompatibilidad
      const response = await api.post('/usuarios/login', credentials);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  getPerfil: async (): Promise<Usuario> => {
    try {
      const response = await api.get('/usuarios/perfil');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  updatePerfil: async (data: UpdatePerfilPayload): Promise<Usuario> => {
    try {
      const response = await api.put('/usuarios/perfil', data);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  deletePerfil: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete('/usuarios/perfil');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  uploadAvatar: async (file: File): Promise<Usuario> => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/usuarios/avatar', formData, {
        headers: { 'Content-Type': undefined },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
