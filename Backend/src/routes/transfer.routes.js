const express = require('express');
const router = express.Router();
const {
  createTransferRequest,
  getAllTransferRequests,
  getTransferRequestById,
  approveTransferRequest,
  rejectTransferRequest,
} = require('../controllers/transfer.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');
const {
  createTransferValidator,
  reviewTransferValidator,
} = require('../validators/transfer.validator');

router.use(verifyToken);

router.route('/')
  .post(createTransferValidator, createTransferRequest)
  .get(getAllTransferRequests);

router.route('/:id')
  .get(getTransferRequestById);

router.patch('/:id/approve', isAdminOrManager, reviewTransferValidator, approveTransferRequest);
router.patch('/:id/reject', isAdminOrManager, reviewTransferValidator, rejectTransferRequest);

module.exports = router;
