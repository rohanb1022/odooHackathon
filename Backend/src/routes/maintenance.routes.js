const express = require('express');
const router = express.Router();
const { raiseMaintenance, approveMaintenance, rejectMaintenance, startMaintenance, resolveMaintenance, getAllMaintenance } = require('../controllers/maintenance.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(raiseMaintenance)
  .get(getAllMaintenance);

router.patch('/:id/approve', isAdminOrManager, approveMaintenance);
router.patch('/:id/reject', isAdminOrManager, rejectMaintenance);
router.patch('/:id/start', isAdminOrManager, startMaintenance);
router.patch('/:id/resolve', isAdminOrManager, resolveMaintenance);

module.exports = router;
