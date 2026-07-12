const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @desc  Get system audit trail / activity logs with filters & pagination
 * @route GET /api/v1/activity-logs
 * @access Admin, Asset Manager
 */
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const { actorId, action, targetModel, targetId, startDate, endDate, page = 1, limit = 40 } = req.query;

  const query = {};
  if (actorId) query.actorId = actorId;
  if (action) query.action = { $regex: action, $options: 'i' };
  if (targetModel) query.targetModel = targetModel;
  if (targetId) query.targetId = targetId;

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    ActivityLog.find(query)
      .populate('actorId', 'firstName lastName email role avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return sendSuccess(res, {
    activityLogs: logs,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }, 'Activity logs fetched successfully');
});
