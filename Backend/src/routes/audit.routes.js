const express = require('express');
const router = express.Router();
const { createAuditCycle, assignAuditors, verifyAsset, closeAuditCycle, getAllAuditCycles } = require('../controllers/audit.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(isAdminOrManager, createAuditCycle)
  .get(getAllAuditCycles);

router.post('/:id/assign', isAdminOrManager, assignAuditors);
router.post('/:id/verify', verifyAsset);
router.post('/:id/close', isAdminOrManager, closeAuditCycle);

module.exports = router;
