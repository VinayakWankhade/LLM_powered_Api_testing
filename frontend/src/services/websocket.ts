class WebSocketService {
  private socket: WebSocket | null = null;
  private subscribers: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private clientId: string;

  constructor() {
    this.clientId = `client-${Math.random().toString(36).substr(2, 9)}`;
  }

  connect(channel: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.host;
    const wsUrl = `${protocol}//${baseUrl}/ws/${channel}?client_id=${this.clientId}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log(`WebSocket connected to channel: ${channel}`);
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.notifySubscribers(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.handleReconnect(channel);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private handleReconnect(channel: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(channel), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    this.subscribers.get(type)?.push(callback);
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    const typeSubscribers = this.subscribers.get(type);
    if (typeSubscribers) {
      const index = typeSubscribers.indexOf(callback);
      if (index !== -1) {
        typeSubscribers.splice(index, 1);
      }
    }
  }

  private notifySubscribers(message: { type: string; data: any }) {
    const subscribers = this.subscribers.get(message.type);
    if (subscribers) {
      subscribers.forEach(callback => callback(message.data));
    }
  }

  send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;