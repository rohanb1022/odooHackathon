const { body } = require('express-validator');

const createAllocationValidator = [
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .isMongoId().withMessage('Invalid Asset ID'),

  body('allocatedTo')
    .notEmpty().withMessage('Recipient User ID (allocatedTo) is required')
    .isMongoId().withMessage('Invalid User ID for allocatedTo'),

  body('departmentId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid Department ID'),

  body('expectedReturnDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('expectedReturnDate must be a valid date'),

  body('conditionAtAllocation')
    .optional({ nullable: true })
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'])
    .withMessage('Invalid condition at allocation'),

  body('conditionNotes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

const returnAllocationValidator = [
  body('allocationId')
    .optional()
    .isMongoId().withMessage('Invalid Allocation ID'),

  body('assetId')
    .optional()
    .isMongoId().withMessage('Invalid Asset ID'),

  body('conditionAtReturn')
    .optional({ nullable: true })
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'])
    .withMessage('Invalid condition at return'),

  body('conditionNotes')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

module.exports = { createAllocationValidator, returnAllocationValidator };
