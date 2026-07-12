const Asset = require('../models/Asset');

/**
 * Generates the next asset tag in the format AF-XXXX
 * Uses a reliable approach: finds max numeric tag in DB.
 * e.g. AF-0001, AF-0042, AF-1000
 */
const generateAssetTag = async () => {
  // Find the asset with the highest numeric tag value
  const assets = await Asset.find({}, { assetTag: 1 })
    .sort({ assetTag: -1 })
    .limit(50)
    .lean();

  if (!assets || assets.length === 0) {
    return 'AF-0001';
  }

  // Parse all tags and find max numeric value
  let maxNum = 0;
  for (const a of assets) {
    if (a.assetTag && a.assetTag.startsWith('AF-')) {
      const num = parseInt(a.assetTag.replace('AF-', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  const next = maxNum + 1;
  return `AF-${String(next).padStart(4, '0')}`;
};

module.exports = { generateAssetTag };
