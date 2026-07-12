const express = require('express');
const router = express.Router();
const { getAssetReport, getUtilizationReport, getMaintenanceReport, getDepartmentReport } = require('../controllers/report.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken, isAdminOrManager);

router.get('/assets', getAssetReport);
router.get('/utilization', getUtilizationReport);
router.get('/maintenance', getMaintenanceReport);
router.get('/departments', getDepartmentReport);

module.exports = router;
