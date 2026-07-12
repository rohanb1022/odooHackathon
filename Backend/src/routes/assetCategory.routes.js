const express = require('express');
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/assetCategory.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../validators/assetCategory.validator');

router.use(verifyToken);

router.route('/')
  .post(isAdmin, createCategoryValidator, createCategory)
  .get(getAllCategories);

router.route('/:id')
  .patch(isAdmin, updateCategoryValidator, updateCategory)
  .delete(isAdmin, deleteCategory);

module.exports = router;
