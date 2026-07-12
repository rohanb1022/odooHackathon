const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema(
  {
    fieldName: { type: String, required: true, trim: true },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean'],
      default: 'text',
    },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    customFields: {
      type: [customFieldSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
