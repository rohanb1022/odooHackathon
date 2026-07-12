const QRCode = require('qrcode');

/**
 * Generates a QR code as a base64 data URL for a given asset
 * @param {Object} asset - Asset document
 * @returns {Promise<string>} Base64 PNG data URL
 */
const generateQRCode = async (asset) => {
  const payload = JSON.stringify({
    assetTag: asset.assetTag,
    name: asset.name,
    id: asset._id.toString(),
  });

  const dataUrl = await QRCode.toDataURL(payload, {
    width: 256,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
  });

  return dataUrl;
};

module.exports = { generateQRCode };
