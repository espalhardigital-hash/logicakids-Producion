import { useEffect, useRef, useCallback } from 'react';

// Hook para escuchar notificaciones push del backend
export function useWebSocket(onSyncRequired: (source: string) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  // Stable ref to the callback to avoid triggering reconnects on every render
  const callbackRef = useRef(onSyncRequired);
  callbackRef.current = onSyncRequired;

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    // Always connect directly to backend port 8000 for WebSocket
    // The nginx/vite proxy for http doesn't apply to WebSocket in built containers
    const wsUrl = 'ws://localhost:8000/ws/admin-sync';

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return; }
        console.log('🔗 [WebSocket] Conectado al canal de sincronización del Administrador');
        // Clear any pending retry timer on successful connection
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SYNC_REQUIRED') {
            console.log('⚡ [WebSocket] Sincronización requerida:', data.source);
            callbackRef.current(data.source);
          }
        } catch (err) {
          console.error('Error parseando mensaje WS:', err);
        }
      };

      ws.onerror = (err) => {
        // Suppress error logging spam — the close handler will retry
        console.warn('[WebSocket] Error de conexión. Se reintentará en 10 segundos.');
      };

      ws.onclose = (event) => {
        wsRef.current = null;
        if (!mountedRef.current) return;
        // Only schedule a retry if the component is still mounted
        console.log(`🔌 [WebSocket] Desconectado (code: ${event.code}). Reconectando en 10 segundos...`);
        retryTimerRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, 10000); // 10s backoff to avoid hammering the server
      };
    } catch (e) {
      console.error('[WebSocket] No se pudo crear la conexión:', e);
      retryTimerRef.current = setTimeout(() => {
        if (mountedRef.current) connect();
      }, 10000);
    }
  }, []); // stable — no deps

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
  }, [connect]);
}
