const mongoose = require('mongoose');

const ASSET_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed',
];

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'];

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    assetTag: {
      type: String,
      unique: true,
      // Auto-generated: AF-0001
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AssetCategory',
      required: [true, 'Category is required'],
    },
    serialNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Serial number cannot exceed 100 characters'],
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
      default: null,
    },
    condition: {
      type: String,
      enum: CONDITIONS,
      default: 'Good',
    },
    status: {
      type: String,
      enum: ASSET_STATUSES,
      default: 'Available',
    },
    isBookable: {
      type: Boolean,
      default: false,
    },
    acquisitionDate: {
      type: Date,
      default: null,
    },
    acquisitionCost: {
      type: Number,
      default: null,
      min: [0, 'Cost cannot be negative'],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    // Stores category-specific custom field values
    customFieldValues: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Photo / document URLs
    documents: [
      {
        type: String,
      },
    ],
    photo: {
      type: String,
      default: null,
    },
    // ── Hardware / Product Info ─────────────────────────────────────────────
    manufacturer: {
      type: String,
      trim: true,
      maxlength: [100, 'Manufacturer cannot exceed 100 characters'],
      default: null,
    },
    modelNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Model number cannot exceed 100 characters'],
      default: null,
    },
    warrantyExpiry: {
      type: Date,
      default: null,
    },
    // Current assignee (mirrors active Allocation — kept in sync for fast lookup)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Filter out soft-deleted assets by default
assetSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
