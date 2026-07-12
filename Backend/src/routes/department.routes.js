const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const {
  createDepartmentValidator,
  updateDepartmentValidator,
} = require('../validators/department.validator');

router.use(verifyToken);

router.route('/')
  .post(isAdmin, createDepartmentValidator, createDepartment)
  .get(getAllDepartments);

router.route('/:id')
  .get(getDepartmentById)
  .patch(isAdmin, updateDepartmentValidator, updateDepartment)
  .delete(isAdmin, deleteDepartment);

module.exports = router;
