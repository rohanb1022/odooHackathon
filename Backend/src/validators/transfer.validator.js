const { body } = require('express-validator');

const createTransferValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .isMongoId().withMessage('Invalid Asset ID'),

  body('toUserId')
    .notEmpty().withMessage('Target recipient User ID (toUserId) is required')
    .isMongoId().withMessage('Invalid User ID for toUserId'),

  body('reason')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

const reviewTransferValidator = [
  body('reviewNote')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Review note cannot exceed 500 characters'),
];

module.exports = { createTransferValidator, reviewTransferValidator };
