const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('customFields')
    .optional()
    .isArray().withMessage('customFields must be an array'),

  body('customFields.*.fieldName')
    .if(body('customFields').exists())
    .notEmpty().withMessage('Custom field name is required'),

  body('customFields.*.fieldType')
    .if(body('customFields').exists())
    .optional()
    .isIn(['text', 'number', 'date', 'boolean']).withMessage('Invalid field type'),
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  body('customFields')
    .optional()
    .isArray().withMessage('customFields must be an array'),
];

module.exports = { createCategoryValidator, updateCategoryValidator };
