// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGetItinerarioDetail } from './useItinerarios';
import { itinerarioService } from '../services/itinerarioService';

// 1. Mockeamos el servicio usando vi.mock()
vi.mock('../services/itinerarioService', () => ({
  itinerarioService: {
    getById: vi.fn(),
  },
}));

describe('Pruebas unitarias para useGetItinerarioDetail', () => {
  // Limpiamos los mocks antes de cada prueba para evitar que se mezclen
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Debe probar el "Happy Path": Estado de carga y datos correctos tras 200 OK', async () => {
    // Definimos qué debe responder nuestro servicio mockeado
    const mockItinerario = { 
      id: 'itinerario-123', 
      destino: 'Tokio, Japón', 
      actividades: [], 
      gastos: [] 
    };
    
    // Simulamos una respuesta exitosa (Promise resolved)
    (itinerarioService.getById as ReturnType<typeof vi.fn>).mockResolvedValue(mockItinerario);

    // Renderizamos el hook de React
    const { result } = renderHook(() => useGetItinerarioDetail('itinerario-123'));

    // Verificamos que el estado inicie con loading: true y sin errores
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Esperamos a que el hook procese la respuesta asíncrona
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verificamos el estado final: loading: false, y los data son correctos
    expect(result.current.data).toEqual(mockItinerario);
    expect(result.current.error).toBeNull();
    
    // Comprobamos que el servicio fue llamado exactamente con el ID que le pasamos
    expect(itinerarioService.getById).toHaveBeenCalledTimes(1);
    expect(itinerarioService.getById).toHaveBeenCalledWith('itinerario-123');
  });

  it('Debe probar el camino de error: Capturar mensaje cuando el servicio falla con un 400 u otro error', async () => {
    const errorMessage = 'Error 400: Bad Request. El itinerario no existe.';
    
    // Simulamos un error del backend (Promise rejected)
    (itinerarioService.getById as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGetItinerarioDetail('itinerario-inválido'));

    // Verificamos estado inicial
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Esperamos a que el estado cambie cuando falle
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verificamos el estado de error: data es null, y el error contiene el mensaje del backend
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.data).toBeNull();
    
    // Verificamos que se haya intentado llamar al servicio
    expect(itinerarioService.getById).toHaveBeenCalledTimes(1);
    expect(itinerarioService.getById).toHaveBeenCalledWith('itinerario-inválido');
  });

  it('No debe hacer la petición si no se le proporciona un ID', async () => {
    // Renderizamos el hook sin un ID definido
    const { result } = renderHook(() => useGetItinerarioDetail(undefined));

    // Como no hay ID, el useEffect pondrá loading en false inmediatamente y regresará
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Verificamos que NUNCA se haya llamado al servicio
    expect(itinerarioService.getById).not.toHaveBeenCalled();
  });
});
