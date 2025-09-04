// WebSocket utilities for managing connections

export class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(
    id: string,
    url: string,
    handlers: {
      onOpen?: () => void;
      onMessage?: (data: any) => void;
      onError?: (error: Event) => void;
      onClose?: () => void;
    }
  ): WebSocket {
    // Close existing connection if any
    this.disconnect(id);

    console.log(`🔌 Connecting WebSocket: ${id}`);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`✅ WebSocket connected: ${id}`);
      this.reconnectAttempts.set(id, 0);
      handlers.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onMessage?.(data);
      } catch (error) {
        console.error(`❌ WebSocket message parse error for ${id}:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`❌ WebSocket error for ${id}:`, error);
      handlers.onError?.(error);
    };

    ws.onclose = () => {
      console.log(`🔌 WebSocket closed: ${id}`);
      handlers.onClose?.();
      
      // Attempt reconnection
      this.attemptReconnect(id, url, handlers);
    };

    this.connections.set(id, ws);
    return ws;
  }

  private attemptReconnect(
    id: string,
    url: string,
    handlers: any
  ): void {
    const attempts = this.reconnectAttempts.get(id) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, attempts); // Exponential backoff
      console.log(`⏳ Reconnecting WebSocket ${id} in ${delay}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.reconnectAttempts.set(id, attempts + 1);
        this.connect(id, url, handlers);
      }, delay);
    } else {
      console.error(`❌ Max reconnection attempts reached for ${id}`);
    }
  }

  disconnect(id: string): void {
    const ws = this.connections.get(id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log(`🔌 Disconnecting WebSocket: ${id}`);
      ws.close();
      this.connections.delete(id);
    }
  }

  disconnectAll(): void {
    console.log('🔌 Disconnecting all WebSockets');
    this.connections.forEach((ws, id) => {
      this.disconnect(id);
    });
  }

  send(id: string, data: any): boolean {
    const ws = this.connections.get(id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
      return true;
    }
    console.error(`❌ Cannot send to WebSocket ${id}: Not connected`);
    return false;
  }

  isConnected(id: string): boolean {
    const ws = this.connections.get(id);
    return ws ? ws.readyState === WebSocket.OPEN : false;
  }
}

export const wsManager = new WebSocketManager();