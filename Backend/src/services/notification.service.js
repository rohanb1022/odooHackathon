const Notification = require('../models/Notification');

/**
 * Creates a notification record in DB and emits a Socket.IO event
 * to the recipient user's room if they are connected.
 *
 * @param {Object} io           - Socket.IO server instance
 * @param {Object} params
 * @param {string} params.userId      - Recipient user ID
 * @param {string} params.type        - Notification type (from enum)
 * @param {string} params.title       - Short title
 * @param {string} params.message     - Full message text
 * @param {string} [params.relatedId] - Related document ID
 * @param {string} [params.relatedModel] - Related model name
 */
const createNotification = async (io, { userId, type, title, message, relatedId = null, relatedModel = null }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedModel,
    });

    // Emit real-time event to the user's socket room
    if (io) {
      io.to(`user:${userId.toString()}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error(`[NotificationService] Failed to create notification: ${error.message}`);
  }
};

/**
 * Bulk-create notifications for multiple users
 */
const notifyMany = async (io, userIds, params) => {
  const promises = userIds.map((userId) =>
    createNotification(io, { ...params, userId })
  );
  return Promise.allSettled(promises);
};

module.exports = { createNotification, notifyMany };
