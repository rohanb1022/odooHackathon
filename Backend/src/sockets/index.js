/**
 * Socket.IO server setup.
 * Each authenticated user joins their personal room: "user:<userId>"
 * This allows the notification service to emit targeted events.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initSockets = (io) => {
  // Middleware: authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password').lean();

      if (!user || user.status === 'Inactive') {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const userRoom = `user:${userId}`;

    // Join user-specific room for targeted notifications
    socket.join(userRoom);

    console.log(`🔌 Socket connected: ${socket.user.name} (${userId})`);

    // Client can join additional rooms (e.g., for global broadcast)
    socket.on('join:room', (room) => {
      socket.join(room);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = initSockets;
