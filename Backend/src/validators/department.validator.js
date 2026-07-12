const { body } = require('express-validator');

const createDepartmentValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('parentDepartment')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid parent department ID'),

  body('headId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid head user ID'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const updateDepartmentValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('parentDepartment')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid parent department ID'),

  body('headId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid head user ID'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

module.exports = { createDepartmentValidator, updateDepartmentValidator };
