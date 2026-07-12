const Asset = require('../models/Asset');

/**
 * Generates the next asset tag in the format AF-XXXX
 * e.g., AF-0001, AF-0042, AF-1000
 */
const generateAssetTag = async () => {
  // Find the latest asset tag (sorted descending)
  const latest = await Asset.findOne({}, { assetTag: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!latest || !latest.assetTag) {
    return 'AF-0001';
  }

  // Extract numeric portion
  const numStr = latest.assetTag.replace('AF-', '');
  const num = parseInt(numStr, 10);
  const next = num + 1;

  return `AF-${String(next).padStart(4, '0')}`;
};

module.exports = { generateAssetTag };
