const express = require('express');
const router = express.Router();
const { createTransferRequest, getAllTransferRequests, approveTransfer, rejectTransfer } = require('../controllers/transfer.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(createTransferRequest)
  .get(isAdminOrManager, getAllTransferRequests);

router.patch('/:id/approve', isAdminOrManager, approveTransfer);
router.patch('/:id/reject', isAdminOrManager, rejectTransfer);

module.exports = router;
