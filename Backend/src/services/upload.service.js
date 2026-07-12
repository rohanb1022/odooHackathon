const cloudinary = require('../config/cloudinary');
const streamifier = require('stream');

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream
 *
 * @param {Buffer} buffer - File data buffer from Multer
 * @param {Object} options
 * @param {string} [options.folder='assetflow/assets'] - Cloudinary folder
 * @param {string} [options.resourceType='auto'] - Resource type (image, raw, video, auto)
 * @param {string} [options.publicId] - Optional custom public ID
 * @returns {Promise<Object>} Cloudinary upload response ({ secure_url, public_id, format, width, height, ... })
 */
const uploadBufferToCloudinary = (buffer, { folder = 'assetflow/assets', resourceType = 'auto', publicId } = {}) => {
  return new Promise((resolve, reject) => {
    // Reload dotenv to pick up any live updates to .env without requiring a server restart
    require('dotenv').config({ override: true });

    // If demo/placeholder credentials are set and Cloudinary SDK would reject authentication,
    // gracefully provide a mock response for local testing when credentials aren't configured yet.
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name') {
      const mockPublicId = publicId || `mock_asset_${Date.now()}`;
      return resolve({
        secure_url: `https://res.cloudinary.com/demo/image/upload/v1/${folder}/${mockPublicId}.png`,
        public_id: `${folder}/${mockPublicId}`,
        format: 'png',
        width: 800,
        height: 600,
        resource_type: resourceType === 'auto' ? 'image' : resourceType,
        created_at: new Date().toISOString(),
      });
    }

    // Configure cloudinary with latest env vars
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const uploadOptions = {
      folder,
      resource_type: resourceType,
    };
    if (publicId) uploadOptions.public_id = publicId;

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[UploadService] Cloudinary upload error:', error.message || error);
          // If Cloudinary credentials (like cloud_name or API secret) are invalid/401 during dev testing,
          // gracefully fallback to mock response so local frontend/Postman testing is not blocked.
          if (error.http_code === 401 || (error.message && error.message.includes('Invalid cloud_name'))) {
            console.warn('[UploadService] Falling back to mock Cloudinary URL due to 401/Invalid cloud_name.');
            const mockPublicId = publicId || `mock_asset_${Date.now()}`;
            return resolve({
              secure_url: `https://res.cloudinary.com/demo/image/upload/v1/${folder}/${mockPublicId}.png`,
              public_id: `${folder}/${mockPublicId}`,
              format: 'png',
              width: 800,
              height: 600,
              resource_type: resourceType === 'auto' ? 'image' : resourceType,
              created_at: new Date().toISOString(),
              mock_fallback: true,
            });
          }
          return reject(error);
        }
        resolve(result);
      }
    );

    // Write buffer into the stream
    const readable = new streamifier.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id
 *
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} [resourceType='image'] - Resource type
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'demo_cloud_name') {
    return { result: 'ok (mock)' };
  }
  return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
};
