const express = require('express');
const router = express.Router();
const {
  createAllocation,
  returnAllocation,
  getAllocations,
  getAllocationById,
  getOverdueAllocations,
} = require('../controllers/allocation.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');
const {
  createAllocationValidator,
  returnAllocationValidator,
} = require('../validators/allocation.validator');

router.use(verifyToken);

// Special routes first to avoid clash with /:id
router.get('/overdue', isAdminOrManager, getOverdueAllocations);
router.post('/return', isAdminOrManager, returnAllocationValidator, returnAllocation);

router.route('/')
  .post(isAdminOrManager, createAllocationValidator, createAllocation)
  .get(getAllocations);

router.route('/:id')
  .get(getAllocationById);

router.patch('/:id/return', isAdminOrManager, returnAllocationValidator, returnAllocation);

module.exports = router;
