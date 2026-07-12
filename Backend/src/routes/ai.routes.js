const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Protect all AI routes with JWT authentication
router.use(verifyToken);

router.post('/chat', aiController.chat);
router.get('/asset-health/:id', aiController.getAssetHealth);
router.get('/predict-maintenance/:id', aiController.predictMaintenance);

module.exports = router;
