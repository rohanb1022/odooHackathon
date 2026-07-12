const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLog.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, isAdminOrManager, getActivityLogs);

module.exports = router;
