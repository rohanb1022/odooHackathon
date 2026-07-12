const { check } = require('express-validator');

exports.createBookingValidator = [
  check('resourceId', 'resourceId (Asset ID) is required and must be valid Mongo ID').isMongoId(),
  check('startTime', 'startTime is required and must be a valid ISO date').isISO8601(),
  check('endTime', 'endTime is required and must be a valid ISO date').isISO8601(),
  check('title', 'Title must not exceed 200 characters').optional().isLength({ max: 200 }),
  check('notes', 'Notes must not exceed 500 characters').optional().isLength({ max: 500 }),
];

exports.rescheduleBookingValidator = [
  check('startTime', 'startTime is required and must be a valid ISO date').isISO8601(),
  check('endTime', 'endTime is required and must be a valid ISO date').isISO8601(),
];

exports.cancelBookingValidator = [
  check('cancelReason', 'Cancel reason must not exceed 300 characters').optional().isLength({ max: 300 }),
];
