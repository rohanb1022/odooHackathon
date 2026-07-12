const asyncHandler = require('../middlewares/asyncHandler');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../services/upload.service');
const { sendSuccess, sendBadRequest } = require('../utils/apiResponse');

/**
 * @desc  Upload a single image for an asset (or user/category) to Cloudinary
 * @route POST /api/v1/assets/upload-image OR /api/v1/upload/image
 * @access All authenticated
 */
exports.uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendBadRequest(res, 'No image file provided in the request (field name should be "file", "image", or "photo")');
  }

  try {
    const folder = req.query.folder || 'assetflow/assets';
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      resourceType: 'image',
    });

    return sendSuccess(res, {
      photoUrl: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }, 'Image uploaded successfully to Cloudinary');
  } catch (error) {
    console.error('[UploadController] Image upload failed:', error.message || error);
    return sendBadRequest(res, `Image upload failed: ${error.message || 'Invalid or unprocessable image file'}`);
  }
});

/**
 * @desc  Upload multiple documents/images to Cloudinary
 * @route POST /api/v1/assets/upload-documents OR /api/v1/upload/documents
 * @access All authenticated
 */
exports.uploadDocuments = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendBadRequest(res, 'No files provided in the request');
  }

  try {
    const folder = req.query.folder || 'assetflow/documents';
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, {
        folder,
        resourceType: 'auto',
      })
    );

    const results = await Promise.all(uploadPromises);
    const formatted = results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      format: r.format,
    }));

    return sendSuccess(res, { documents: formatted }, 'Documents uploaded successfully to Cloudinary');
  } catch (error) {
    console.error('[UploadController] Documents upload failed:', error.message || error);
    return sendBadRequest(res, `Documents upload failed: ${error.message || 'Invalid file format'}`);
  }
});

/**
 * @desc  Delete an image/document from Cloudinary by publicId
 * @route DELETE /api/v1/assets/delete-file OR /api/v1/upload/file
 * @access Admin, Asset Manager
 */
exports.deleteUploadedFile = asyncHandler(async (req, res) => {
  const { publicId, resourceType = 'image' } = req.body;
  if (!publicId) {
    return sendBadRequest(res, 'publicId is required to delete the file');
  }

  await deleteFromCloudinary(publicId, resourceType);
  return sendSuccess(res, null, 'File deleted from Cloudinary');
});
