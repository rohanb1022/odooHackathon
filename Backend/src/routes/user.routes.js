const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  promoteUser,
  updateUserStatus,
} = require('../controllers/user.controller');
const { verifyToken, isAdmin, isAdminOrManager } = require('../middlewares/auth.middleware');
const { promoteValidator, statusValidator } = require('../validators/user.validator');

router.use(verifyToken);

router.get('/', isAdminOrManager, getAllUsers);
router.get('/:id', isAdminOrManager, getUserById);
router.patch('/:id/promote', isAdmin, promoteValidator, promoteUser);
router.patch('/:id/status', isAdmin, statusValidator, updateUserStatus);

module.exports = router;
