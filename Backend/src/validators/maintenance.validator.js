const { check } = require('express-validator');

exports.raiseMaintenanceValidator = [
  check('assetId', 'assetId is required and must be valid Mongo ID').isMongoId(),
  check('description', 'Issue description is required (max 2000 chars)').notEmpty().isLength({ max: 2000 }),
  check('priority', 'Priority must be Low, Medium, High, or Critical').optional().isIn(['Low', 'Medium', 'High', 'Critical']),
];

exports.rejectMaintenanceValidator = [
  check('rejectionReason', 'Rejection reason is required when rejecting').notEmpty().isLength({ max: 500 }),
];

exports.resolveMaintenanceValidator = [
  check('resolutionNotes', 'Resolution notes must not exceed 2000 characters').optional().isLength({ max: 2000 }),
];
