const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io = null;

// Store connected users by their user ID
const connectedUsers = new Map();

/**
 * Initialize Socket.io with the HTTP server
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
            ? [process.env.FRONTEND_URL]
            : []
          : ['http://localhost:3000', 'http://localhost:3005'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      // Allow connection without auth for demo purposes
      socket.userId = null;
      socket.userRole = 'guest';
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      // Allow connection even with invalid token for demo
      socket.userId = null;
      socket.userRole = 'guest';
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id} (User: ${socket.userId || 'guest'})`);

    // Store connection if authenticated
    if (socket.userId) {
      connectedUsers.set(socket.userId, socket.id);

      // Join user-specific room
      socket.join(`user:${socket.userId}`);

      // Join role-based room
      socket.join(`role:${socket.userRole}`);
    }

    // Handle joining specific rooms (e.g., order tracking)
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
      logger.info(`📦 Socket ${socket.id} joined order:${orderId}`);
    });

    socket.on('leave:order', (orderId) => {
      socket.leave(`order:${orderId}`);
      logger.info(`📦 Socket ${socket.id} left order:${orderId}`);
    });

    // Handle partner-specific room
    socket.on('join:partner', (partnerId) => {
      socket.join(`partner:${partnerId}`);
      logger.info(`👨‍🍳 Socket ${socket.id} joined partner:${partnerId}`);
    });

    // Handle admin room
    socket.on('join:admin', () => {
      if (socket.userRole === 'admin') {
        socket.join('admin');
        logger.info(`👑 Admin socket ${socket.id} joined admin room`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

/**
 * Get the Socket.io instance
 */
const getIO = () => {
  if (!io) {
    logger.warn('⚠️ Socket.io not initialized');
    return null;
  }
  return io;
};

/**
 * Emit event to a specific user
 */
const emitToUser = (userId, event, data) => {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to all partners
 */
const emitToPartners = (event, data) => {
  const io = getIO();
  if (io) {
    io.to('role:partner').emit(event, data);
  }
};

/**
 * Emit event to a specific partner
 */
const emitToPartner = (partnerId, event, data) => {
  const io = getIO();
  if (io) {
    io.to(`partner:${partnerId}`).emit(event, data);
  }
};

/**
 * Emit event to all admins
 */
const emitToAdmins = (event, data) => {
  const io = getIO();
  if (io) {
    io.to('admin').emit(event, data);
  }
};

/**
 * Emit order status update
 */
const emitOrderUpdate = (orderId, status, additionalData = {}) => {
  const io = getIO();
  if (io) {
    io.to(`order:${orderId}`).emit('order:update', {
      orderId,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData,
    });
  }
};

/**
 * Emit delivery status update
 */
const emitDeliveryUpdate = (deliveryId, customerId, partnerId, status, data = {}) => {
  const io = getIO();
  if (io) {
    const payload = {
      deliveryId,
      status,
      timestamp: new Date().toISOString(),
      ...data,
    };

    // Notify customer
    emitToUser(customerId, 'delivery:update', payload);

    // Notify partner
    emitToPartner(partnerId, 'delivery:update', payload);
  }
};

/**
 * Emit new order notification to partner
 */
const emitNewOrder = (partnerId, orderData) => {
  emitToPartner(partnerId, 'order:new', {
    ...orderData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit payment notification
 */
const emitPaymentNotification = (userId, paymentData) => {
  emitToUser(userId, 'payment:update', {
    ...paymentData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Emit notification to specific user
 */
const emitNotification = (userId, notification) => {
  emitToUser(userId, 'notification', {
    id: Date.now(),
    ...notification,
    timestamp: new Date().toISOString(),
    read: false,
  });
};

/**
 * Broadcast platform-wide notification (e.g., maintenance)
 */
const broadcastNotification = (notification) => {
  const io = getIO();
  if (io) {
    io.emit('notification:broadcast', {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToPartners,
  emitToPartner,
  emitToAdmins,
  emitOrderUpdate,
  emitDeliveryUpdate,
  emitNewOrder,
  emitPaymentNotification,
  emitNotification,
  broadcastNotification,
};
