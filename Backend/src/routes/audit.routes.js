const express = require('express');
const router = express.Router();
const {
  createAuditCycle,
  assignAuditors,
  verifyAsset,
  closeAuditCycle,
  getAllAuditCycles,
  getAuditCycleById,
} = require('../controllers/audit.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');
const {
  createAuditCycleValidator,
  assignAuditorsValidator,
  verifyAssetValidator,
} = require('../validators/audit.validator');

router.use(verifyToken);

router.route('/')
  .post(isAdminOrManager, createAuditCycleValidator, createAuditCycle)
  .get(getAllAuditCycles);

router.get('/:id', getAuditCycleById);
router.post('/:id/assign', isAdminOrManager, assignAuditorsValidator, assignAuditors);
router.post('/:id/verify', verifyAssetValidator, verifyAsset);
router.post('/:id/close', isAdminOrManager, closeAuditCycle);

module.exports = router;

