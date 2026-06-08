import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminContent } from './useAdminContent';
import * as storageService from '../../services/storageService';

vi.mock('../../services/storageService', () => ({
  getPreguntasByLevel: vi.fn(),
  getNivelTeoria: vi.fn()
}));

describe('useAdminContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads data successfully on initial render', async () => {
    // Mock the backend responses
    (storageService.getPreguntasByLevel as any).mockResolvedValue([{ id: 1, enunciado: "test" }]);
    (storageService.getNivelTeoria as any).mockResolvedValue({
      titulo: "Test Teoria",
      diccionario: {},
      ejemplos: [],
      interactivos: []
    });

    const { result } = renderHook(() => useAdminContent());

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.questions).toHaveLength(1);
    expect(result.current.questions[0].enunciado).toBe("test");
    expect(result.current.theory?.titulo).toBe("Test Teoria");
  });

  it('handles empty theory by initializing default structure', async () => {
    (storageService.getPreguntasByLevel as any).mockResolvedValue([]);
    (storageService.getNivelTeoria as any).mockResolvedValue(null); // No theory found

    const { result } = renderHook(() => useAdminContent());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.theory).toBeDefined();
    expect(result.current.theory?.fase_id).toBe(2);
    expect(result.current.theory?.titulo).toBe('');
    expect(result.current.theory?.ejemplos).toEqual([]);
  });
});
