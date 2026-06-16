import { create } from 'zustand';

interface SimuladoPregunta {
  id: string;
  enunciado: string;
  datos_numericos: any;
  requiere_subrayado: boolean;
  alternativas: { id: string; texto: string }[];
}

interface SimuladoState {
  sessionId: string | null;
  preguntas: SimuladoPregunta[];
  respuestas: Record<string, string>; // pregunta_id -> alternativa_id
  marcadoresRevision: string[]; // pregunta_id[]
  tiempoRestanteSegundos: number;
  tiempoTotalSegundos: number;
  estado: 'NO_INICIADO' | 'CARGANDO' | 'EN_CURSO' | 'FINALIZANDO' | 'FINALIZADO';
  error: string | null;
  resultados: any | null;
  
  // Acciones
  iniciarSimulado: (moduloId: number, nivelId: number) => Promise<void>;
  seleccionarRespuesta: (preguntaId: string, alternativaId: string) => void;
  toggleMarcador: (preguntaId: string) => void;
  tickTiempo: () => void;
  entregarSimulado: () => Promise<void>;
  syncProgreso: () => Promise<void>;
}

export const useSimuladoStore = create<SimuladoState>((set, get) => ({
  sessionId: null,
  preguntas: [],
  respuestas: {},
  marcadoresRevision: [],
  tiempoRestanteSegundos: 0,
  tiempoTotalSegundos: 0,
  estado: 'NO_INICIADO',
  error: null,
  resultados: null,

  iniciarSimulado: async (moduloId: number, nivelId: number) => {
    set({ estado: 'CARGANDO', error: null });
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const response = await fetch('/api/fases/9/simulados/iniciar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ simulacro_numero: moduloId })
      });
      
      if (!response.ok) {
        throw new Error('Error al iniciar simulado');
      }
      
      const data = await response.json();
      set({
        sessionId: data.session_id,
        preguntas: data.preguntas,
        tiempoRestanteSegundos: data.tiempo_total_segundos,
        tiempoTotalSegundos: data.tiempo_total_segundos,
        respuestas: {},
        marcadoresRevision: [],
        estado: 'EN_CURSO',
        error: null,
        resultados: null
      });
    } catch (error: any) {
      set({ estado: 'NO_INICIADO', error: error.message });
    }
  },

  seleccionarRespuesta: (preguntaId: string, alternativaId: string) => {
    set((state) => ({
      respuestas: {
        ...state.respuestas,
        [preguntaId]: alternativaId
      }
    }));
    get().syncProgreso(); // Trigger sync
  },

  toggleMarcador: (preguntaId: string) => {
    set((state) => {
      const isMarked = state.marcadoresRevision.includes(preguntaId);
      const newMarcadores = isMarked
        ? state.marcadoresRevision.filter(id => id !== preguntaId)
        : [...state.marcadoresRevision, preguntaId];
      
      return { marcadoresRevision: newMarcadores };
    });
    get().syncProgreso(); // Trigger sync
  },

  tickTiempo: () => {
    set((state) => {
      if (state.estado !== 'EN_CURSO' || state.tiempoRestanteSegundos <= 0) return state;
      const newTime = state.tiempoRestanteSegundos - 1;
      
      // Sync every 30 seconds
      if (newTime % 30 === 0) {
        get().syncProgreso();
      }
      
      return { tiempoRestanteSegundos: newTime };
    });
  },

  syncProgreso: async () => {
    const state = get();
    if (!state.sessionId || state.estado !== 'EN_CURSO') return;
    
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      await fetch(`/api/fases/9/simulados/${state.sessionId}/save_progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          respuestas: state.respuestas,
          marcadores_revision: state.marcadoresRevision,
          tiempo_restante_segundos: state.tiempoRestanteSegundos
        })
      });
    } catch (error) {
      console.error("Error syncing progress", error);
    }
  },

  entregarSimulado: async () => {
    const state = get();
    if (!state.sessionId) return;
    
    set({ estado: 'FINALIZANDO' });
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
      const response = await fetch(`/api/fases/9/simulados/${state.sessionId}/entregar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          respuestas: state.respuestas,
          tiempo_restante_segundos: state.tiempoRestanteSegundos
        })
      });
      
      if (!response.ok) throw new Error("Error al entregar");
      const data = await response.json();
      
      set({ estado: 'FINALIZADO', resultados: data });
    } catch (error: any) {
      set({ estado: 'EN_CURSO', error: error.message });
    }
  }
}));
