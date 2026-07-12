const { body, query } = require('express-validator');

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

const registerAssetValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Asset name is required')
    .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),

  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),

  body('serialNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Serial number cannot exceed 100 characters'),

  body('location')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters'),

  body('condition')
    .optional()
    .isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(', ')}`),

  body('isBookable')
    .optional()
    .isBoolean().withMessage('isBookable must be a boolean'),

  body('acquisitionDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('acquisitionDate must be a valid date'),

  body('acquisitionCost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('acquisitionCost must be a positive number'),

  body('departmentId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid department ID'),

  body('photo')
    .optional({ nullable: true })
    .isURL().withMessage('Photo must be a valid URL'),

  body('manufacturer')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Manufacturer cannot exceed 100 characters'),

  body('modelNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Model number cannot exceed 100 characters'),

  body('warrantyExpiry')
    .optional({ nullable: true })
    .isISO8601().withMessage('warrantyExpiry must be a valid date'),

  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid assignedTo user ID'),
];

const updateAssetValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),

  body('categoryId')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),

  body('serialNumber')
    .optional({ nullable: true })
    .trim(),

  body('location')
    .optional({ nullable: true })
    .trim(),

  body('condition')
    .optional()
    .isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(', ')}`),

  body('status')
    .optional()
    .isIn(['Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'])
    .withMessage('Invalid asset status'),

  body('isBookable')
    .optional()
    .isBoolean().withMessage('isBookable must be a boolean'),

  body('departmentId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid department ID'),

  body('manufacturer')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Manufacturer cannot exceed 100 characters'),

  body('modelNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Model number cannot exceed 100 characters'),

  body('warrantyExpiry')
    .optional({ nullable: true })
    .isISO8601().withMessage('warrantyExpiry must be a valid date'),

  body('assignedTo')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid assignedTo user ID'),
];

module.exports = { registerAssetValidator, updateAssetValidator };
