const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, getDashboard);

module.exports = router;
