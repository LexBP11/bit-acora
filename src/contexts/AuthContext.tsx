import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Usuario } from '../interfaces';
import { usuarioService } from '../services/usuarioService';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userJson: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userJson = localStorage.getItem('user');
      
      if (token && userJson) {
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error al parsear usuario:', error);
          usuarioService.logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (token: string, userJson: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', userJson);
    const userData = JSON.parse(userJson);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    usuarioService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
