const express = require('express');
const router = express.Router();
const {
  raiseMaintenance,
  approveMaintenance,
  assignMaintenance,
  rejectMaintenance,
  startMaintenance,
  resolveMaintenance,
  getAllMaintenance,
  updateStatus,
} = require('../controllers/maintenance.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');
const {
  raiseMaintenanceValidator,
  rejectMaintenanceValidator,
  resolveMaintenanceValidator,
} = require('../validators/maintenance.validator');
const upload = require('../middlewares/upload.middleware');

router.use(verifyToken);

router.route('/')
  .post(upload.single('photo'), raiseMaintenanceValidator, raiseMaintenance)
  .get(getAllMaintenance);

router.patch('/:id/approve', isAdminOrManager, approveMaintenance);
router.patch('/:id/assign', isAdminOrManager, assignMaintenance);
router.patch('/:id/reject', isAdminOrManager, rejectMaintenanceValidator, rejectMaintenance);
router.patch('/:id/start', isAdminOrManager, startMaintenance);
router.patch('/:id/resolve', isAdminOrManager, resolveMaintenanceValidator, resolveMaintenance);
router.patch('/:id/status', updateStatus);

module.exports = router;


