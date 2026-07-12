const express = require('express');
const router = express.Router();
const { registerAsset, getAllAssets, getAssetById, updateAsset, deleteAsset, getAssetQR } = require('../controllers/asset.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.use(verifyToken);

router.route('/')
  .post(isAdminOrManager, registerAsset)
  .get(getAllAssets);

router.get('/:id/qr', getAssetQR);

router.route('/:id')
  .get(getAssetById)
  .patch(isAdminOrManager, updateAsset)
  .delete(isAdminOrManager, deleteAsset);

module.exports = router;
