const { check } = require('express-validator');

exports.createAuditCycleValidator = [
  check('title', 'Audit cycle title is required and max 200 characters').notEmpty().isLength({ max: 200 }),
  check('scopeType', 'Scope type must be department, location, or all').isIn(['department', 'location', 'all']),
  check('dateRangeStart', 'Start date must be a valid ISO date').isISO8601(),
  check('dateRangeEnd', 'End date must be a valid ISO date').isISO8601(),
  check('auditorIds', 'auditorIds must be an array of valid Mongo IDs').optional().isArray(),
];

exports.assignAuditorsValidator = [
  check('auditorIds', 'auditorIds must be an array of valid Mongo IDs').isArray().notEmpty(),
  check('auditorIds.*', 'Each auditorId must be a valid Mongo ID').isMongoId(),
];

exports.verifyAssetValidator = [
  check('assetId', 'assetId is required and must be a valid Mongo ID').isMongoId(),
  check('result', 'Audit result must be Verified, Missing, or Damaged').isIn(['Verified', 'Missing', 'Damaged']),
  check('notes', 'Notes cannot exceed 1000 characters').optional().isLength({ max: 1000 }),
];
