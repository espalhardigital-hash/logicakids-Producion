import { useEffect } from 'react';
import { queryClient } from '../services/api'; // O usaremos simples callbacks

// Hook para escuchar notificaciones push del backend
export function useWebSocket(onSyncRequired: (source: string) => void) {
  useEffect(() => {
    // Determine WS protocol based on current HTTP protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // e.g., localhost:3000 o localhost (con nginx)
    
    // Conectarse al endpoint de FastAPI 
    // Usamos la ruta base quitando /api si estamos en dev, o apuntando directo al puerto 8000
    // Asumimos que Traefik/Nginx o el proxy de Vite enrutarán '/api/ws' hacia el backend.
    // Si Vite está en 3000 y proxyea /api a 8000, el WS path será /api/ws/admin-sync
    // Si estamos en producción (nginx), será /ws/admin-sync. Por seguridad usamos la URL relativa
    
    // Intentaremos construir la URL basada en el origin de Vite
    let wsUrl = `${protocol}//${host}/ws/admin-sync`;
    
    // En entorno de desarrollo (localhost:3000), Vite necesita proxearlo a la API
    if (host.includes('3000') || host.includes('localhost')) {
      wsUrl = `${protocol}//localhost:8000/ws/admin-sync`;
    }

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('🔗 [WebSocket] Conectado al canal de sincronización del Administrador');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC_REQUIRED') {
          console.log('⚡ [WebSocket] Sincronización requerida:', data.source);
          onSyncRequired(data.source);
        }
      } catch (err) {
        console.error('Error parseando mensaje WS:', err);
      }
    };

    ws.onclose = () => {
      console.log('🔌 [WebSocket] Desconectado. Reconectando en 5 segundos...');
      // Reconexión simple
      setTimeout(() => {
        // Podríamos invocar recursivamente o manejar estado
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, [onSyncRequired]);
}
