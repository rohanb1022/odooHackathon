const ActivityLog = require('../models/ActivityLog');

/**
 * Writes an activity log entry.
 *
 * @param {Object} params
 * @param {string} params.actorId     - User performing the action
 * @param {string} params.action      - Action string e.g. "ASSET_CREATED"
 * @param {string} [params.targetModel] - Model name affected
 * @param {string} [params.targetId]  - ID of the affected document
 * @param {Object} [params.meta]      - Extra context
 * @param {string} [params.ipAddress] - Requester IP
 */
const log = async ({ actorId, action, targetModel = 'System', targetId = null, meta = {}, ipAddress = null }) => {
  try {
    await ActivityLog.create({
      actorId,
      action,
      targetModel,
      targetId,
      meta,
      ipAddress,
    });
  } catch (error) {
    // Non-fatal: log to console but don't crash the request
    console.error(`[ActivityLogService] Failed to write log: ${error.message}`);
  }
};

/**
 * Extracts the real IP from a request object
 */
const getIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
};

module.exports = { log, getIp };
