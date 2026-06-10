from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        # Lista de clientes conectados a la plataforma en tiempo real
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        """Envía un mensaje de texto a todos los clientes conectados"""
        # Se itera sobre una copia para evitar errores si alguien se desconecta durante el ciclo
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                # Si falla (ej: cliente cerró repentinamente), lo eliminamos
                self.disconnect(connection)

# Instancia global del gestor
manager = ConnectionManager()
