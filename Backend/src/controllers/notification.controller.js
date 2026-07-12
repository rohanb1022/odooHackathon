const Notification = require('../models/Notification');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess, sendNotFound } = require('../utils/apiResponse');

/**
 * @desc  Get logged-in user's notifications (paginated, sorted by newest)
 * @route GET /api/v1/notifications
 * @access Authenticated
 */
exports.getNotifications = asyncHandler(async (req, res) => {
  const { isRead, page = 1, limit = 30 } = req.query;

  const query = { userId: req.user._id };
  if (isRead !== undefined) {
    query.isRead = isRead === 'true';
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  return sendSuccess(res, {
    notifications,
    unreadCount,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }, 'Notifications fetched successfully');
});

/**
 * @desc  Mark a single notification as read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Authenticated
 */
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) return sendNotFound(res, 'Notification not found');

  return sendSuccess(res, { notification }, 'Notification marked as read');
});

/**
 * @desc  Mark all user notifications as read
 * @route PATCH /api/v1/notifications/read-all
 * @access Authenticated
 */
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return sendSuccess(res, { modifiedCount: result.modifiedCount }, 'All notifications marked as read');
});
