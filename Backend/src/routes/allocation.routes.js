const express = require('express');
const router = express.Router();
const { allocateAsset, returnAsset, getAllAllocations, getOverdueAllocations } = require('../controllers/allocation.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.get('/overdue', isAdminOrManager, getOverdueAllocations);
router.post('/', isAdminOrManager, allocateAsset);
router.post('/return', isAdminOrManager, returnAsset);
router.get('/', isAdminOrManager, getAllAllocations);

module.exports = router;
