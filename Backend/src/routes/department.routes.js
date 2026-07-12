const express = require('express');
const router = express.Router();
const { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controllers/department.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(isAdmin, createDepartment)
  .get(getAllDepartments);

router.route('/:id')
  .get(getDepartmentById)
  .patch(isAdmin, updateDepartment)
  .delete(isAdmin, deleteDepartment);

module.exports = router;
