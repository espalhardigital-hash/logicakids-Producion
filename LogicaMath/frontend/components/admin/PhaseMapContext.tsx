import React, { createContext, useContext, useState, useEffect } from 'react';
import { PHASE_MAPS as STATIC_PHASE_MAPS, PhaseMap } from './phaseMaps';

interface PhaseMapContextType {
  phaseMaps: PhaseMap[];
  loading: boolean;
  savePhaseMaps: (newMaps: PhaseMap[]) => Promise<void>;
  refreshPhaseMaps: () => Promise<void>;
}

const PhaseMapContext = createContext<PhaseMapContextType | undefined>(undefined);

export const PhaseMapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phaseMaps, setPhaseMaps] = useState<PhaseMap[]>(STATIC_PHASE_MAPS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPhaseMaps = async () => {
    try {
      const token = localStorage.getItem('token');
      // Decode role from JWT payload to know if reseed is safe
      let isAdmin = false;
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          isAdmin = payload?.role === 'admin';
        } catch (_) { /* malformed token */ }
      }

      const response = await fetch('/api/admin/phase-maps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        try {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            if (data.length !== STATIC_PHASE_MAPS.length) {
               console.log("Mismatched phase maps length. Reseeding with static maps...");
               if (isAdmin) await savePhaseMaps(STATIC_PHASE_MAPS);
               setPhaseMaps(STATIC_PHASE_MAPS);
            } else {
               setPhaseMaps(data);
            }
          } else {
            // Si está vacío o no es arreglo, auto-semilla con el estático (solo si es admin)
            if (isAdmin) await savePhaseMaps(STATIC_PHASE_MAPS);
            setPhaseMaps(STATIC_PHASE_MAPS);
          }
        } catch (e) {
          console.error("Error parsing phase maps JSON:", e);
          setPhaseMaps(STATIC_PHASE_MAPS);
        }
      } else {
         // Non-admin or unauthenticated — silently fall back to static maps
         setPhaseMaps(STATIC_PHASE_MAPS);
      }
    } catch (error) {
      console.error("Error fetching phase maps:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePhaseMaps = async (newMaps: PhaseMap[]) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/phase-maps', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMaps)
      });
      if (res.ok) {
        setPhaseMaps(newMaps);
      }
    } catch (e) {
      console.error("Error saving phase maps:", e);
      throw e;
    }
  };

  useEffect(() => {
    fetchPhaseMaps();
  }, []);

  return (
    <PhaseMapContext.Provider value={{ phaseMaps, loading, savePhaseMaps, refreshPhaseMaps: fetchPhaseMaps }}>
      {children}
    </PhaseMapContext.Provider>
  );
};

export const usePhaseMapContext = () => {
  const context = useContext(PhaseMapContext);
  if (context === undefined) {
    throw new Error('usePhaseMapContext must be used within a PhaseMapProvider');
  }
  return context;
};
