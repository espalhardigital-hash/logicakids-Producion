import { describe, it, expect, vi } from 'vitest';
import { getFase5Dashboard, getFase5Question } from './Fase5Service';
import { getFase6Dashboard, getFase6Question } from '../fase6/Fase6Service';

// Mock the global fetch
global.fetch = vi.fn();

describe('Fase 5 and Fase 6 API Services', () => {
  it('should fetch Fase 5 dashboard successfully', async () => {
    const mockResponse = {
      progreso_global: 50,
      modulos_desbloqueados: [1, 2],
      modulos: []
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getFase5Dashboard();
    expect(result.progreso_global).toBe(50);
    expect(global.fetch).toHaveBeenCalledWith('https://logica.espalhar.shop/api/fase5/dashboard', expect.any(Object));
  });

  it('should fetch Fase 6 question successfully', async () => {
    const mockQuestion = {
      id: 101,
      enunciado: 'Prueba de reconocimiento 3D',
      opciones: ['A', 'B'],
      respuesta_correcta: 'A'
    };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuestion,
    });

    const result = await getFase6Question(1, 1);
    expect(result.id).toBe(101);
    expect(global.fetch).toHaveBeenCalledWith('https://logica.espalhar.shop/api/fase6/modulo/1/nivel/1/pregunta?reload=false', expect.any(Object));
  });
});
