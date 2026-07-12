const express = require('express');
const router = express.Router();
const {
  registerAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetQR,
} = require('../controllers/asset.controller');
const {
  uploadImage,
  uploadDocuments,
  deleteUploadedFile,
} = require('../controllers/upload.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');
const { registerAssetValidator, updateAssetValidator } = require('../validators/asset.validator');
const upload = require('../middlewares/upload.middleware');

router.use(verifyToken);

// Standalone upload endpoints
router.post('/upload-image', upload.single('file'), uploadImage);
router.post('/upload-documents', upload.array('files', 5), uploadDocuments);
router.delete('/delete-file', isAdminOrManager, deleteUploadedFile);

// Asset CRUD endpoints with multipart upload support
const assetUploadFields = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
]);

router.route('/')
  .post(isAdminOrManager, assetUploadFields, registerAssetValidator, registerAsset)
  .get(getAllAssets);

// QR must be before /:id to avoid clash
router.get('/:id/qr', getAssetQR);

router.route('/:id')
  .get(getAssetById)
  .patch(isAdminOrManager, assetUploadFields, updateAssetValidator, updateAsset)
  .delete(isAdminOrManager, deleteAsset);

module.exports = router;

