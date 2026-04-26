const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

/**
 * WebSocket Server Configuration
 * Handles real-time chat and notifications
 */

class ChatWebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    
    this.clients = new Map(); // Map of userId -> Set of WebSocket connections
    this.setupHandlers();
  }

  setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected');

      // Authenticate connection
      const token = new URL(`http://localhost${req.url}`).searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Unauthorized: No token provided');
        return;
      }

      let userId;
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        userId = decoded.userId;
      } catch (error) {
        ws.close(1008, 'Unauthorized: Invalid token');
        return;
      }

      // Store connection
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(ws);

      // Broadcast user presence
      this.broadcastPresence(userId, true);

      // Setup message handlers
      ws.on('message', (data) => {
        this.handleMessage(ws, userId, data);
      });

      ws.on('close', () => {
        this.handleClose(ws, userId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        payload: { status: 'connected', userId }
      }));
    });
  }

  handleMessage(ws, userId, data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'chat:message':
          this.handleChatMessage(ws, userId, message.payload);
          break;
        
        case 'chat:typing':
          this.broadcastToUser(userId, {
            type: 'chat:typing',
            payload: message.payload
          }, ws);
          break;
        
        case 'notification:read':
          this.handleNotificationRead(userId, message.payload);
          break;
        
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  handleChatMessage(ws, userId, payload) {
    // Broadcast to all connections of this user
    const response = {
      type: 'chat:message',
      payload: {
        ...payload,
        userId,
        messageId: Date.now()
      }
    };
    
    this.broadcastToUser(userId, response);
    
    // In production, also save to database and process with AI
    console.log(`Chat message from user ${userId}:`, payload.message);
  }

  handleNotificationRead(userId, payload) {
    // Mark notification as read
    // In production, update database
    const response = {
      type: 'notification:read',
      payload: {
        notificationId: payload.notificationId,
        read: true
      }
    };
    
    this.broadcastToUser(userId, response);
  }

  handleClose(ws, userId) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.delete(ws);
      
      // If user has no more connections, remove from clients map
      if (userConnections.size === 0) {
        this.clients.delete(userId);
        this.broadcastPresence(userId, false);
      }
    }
    
    console.log('WebSocket client disconnected');
  }

  /**
   * Send message to all connections of a user
   */
  broadcastToUser(userId, message, excludeWs = null) {
    const userConnections = this.clients.get(userId);
    if (!userConnections) return;

    const data = JSON.stringify(message);
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN && ws !== excludeWs) {
        ws.send(data);
      }
    });
  }

  /**
   * Broadcast user presence
   */
  broadcastPresence(userId, isOnline) {
    const message = {
      type: 'presence',
      payload: {
        userId,
        isOnline,
        timestamp: new Date().toISOString()
      }
    };

    // Broadcast to all connected clients
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Send notification to user
   */
  sendNotification(userId, notification) {
    const message = {
      type: 'notification',
      payload: {
        ...notification,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
    };

    this.broadcastToUser(userId, message);
  }

  /**
   * Get number of connected users
   */
  getConnectedUsersCount() {
    return this.clients.size;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connectedUsers: this.clients.size,
      totalConnections: Array.from(this.clients.values())
        .reduce((sum, set) => sum + set.size, 0)
    };
  }
}

module.exports = ChatWebSocketServer;
