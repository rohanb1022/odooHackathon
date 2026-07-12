const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, promoteUser, updateUserStatus } = require('../controllers/user.controller');
const { verifyToken, isAdmin, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', isAdminOrManager, getAllUsers);
router.get('/:id', isAdminOrManager, getUserById);
router.patch('/:id/promote', isAdmin, promoteUser);
router.patch('/:id/status', isAdmin, updateUserStatus);

module.exports = router;
