const { body } = require('express-validator');

const promoteValidator = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['employee', 'department_head', 'asset_manager', 'admin'])
    .withMessage('Role must be one of: employee, department_head, asset_manager, admin'),
];

const statusValidator = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

module.exports = { promoteValidator, statusValidator };
