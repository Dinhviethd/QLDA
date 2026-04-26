/**
 * WebSocket Real-Time Service
 * Handles real-time chat and notifications
 */

class WebSocketService {
  constructor(url = 'ws://localhost:5000/ws') {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.messageHandlers = new Map();
    this.isConnected = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.url}?token=${token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.isConnected = false;
          this.attemptReconnect(token);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.isConnected = false;
    }
  }

  /**
   * Send message via WebSocket
   */
  send(messageType, payload) {
    if (!this.isConnected) {
      console.warn('WebSocket not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify({
        type: messageType,
        payload,
        timestamp: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }

  /**
   * Register handler for message type
   */
  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType).push(handler);
  }

  /**
   * Unregister handler for message type
   */
  off(messageType, handler) {
    if (this.messageHandlers.has(messageType)) {
      const handlers = this.messageHandlers.get(messageType);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming message
   */
  handleMessage(data) {
    const { type, payload } = data;
    
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in handler for ${type}:`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Send chat message via WebSocket
   */
  sendChatMessage(message, context = '') {
    return this.send('chat:message', {
      message,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(isTyping) {
    return this.send('chat:typing', {
      isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(handler) {
    this.on('notification', handler);
  }

  /**
   * Subscribe to user presence updates
   */
  subscribeToPresence(handler) {
    this.on('presence', handler);
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : null,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const wsService = new WebSocketService();

export default wsService;
