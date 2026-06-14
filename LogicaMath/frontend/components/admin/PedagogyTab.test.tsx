// @vitest-environment jsdom
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PedagogyTab from './PedagogyTab';

// Mock matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock services that do API calls
vi.mock('../../services/storageService', () => ({
  getAdminSettings: vi.fn().mockResolvedValue(null),
  saveAdminSettings: vi.fn().mockResolvedValue(true),
  getModularConfigs: vi.fn().mockResolvedValue([]),
  saveModularConfig: vi.fn().mockResolvedValue(true),
  createModularConfig: vi.fn().mockResolvedValue(true),
}));

describe('PedagogyTab React Crash Fix', () => {
  it('should render the component without throwing an error in AnimatePresence', async () => {
    // Attempt to render the component.
    // If the multiple children array in AnimatePresence bug was present, 
    // it would crash after loading when Framer Motion tries to mount the children.
    const { container } = render(<PedagogyTab />);
    
    // Validate initial loading state
    expect(await screen.findByText(/Cargando base de datos pedagógica/i)).not.toBeNull();
    
    // Wait for the component to finish loading and display the main interface
    await waitFor(() => {
      expect(screen.getByText(/Gestión Pedagógica Avanzada/i)).not.toBeNull();
    }, { timeout: 3000 });

    // Validate that the "Configuración por Fases" view is rendered without crashing (default tab is Fase 1)
    expect(screen.getByText(/Parámetros por Defecto de Fase/i)).not.toBeNull();
  });
});
