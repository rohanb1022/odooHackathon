const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/assetCategory.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(isAdmin, createCategory)
  .get(getAllCategories);

router.route('/:id')
  .patch(isAdmin, updateCategory)
  .delete(isAdmin, deleteCategory);

module.exports = router;
