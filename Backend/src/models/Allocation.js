const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    allocatedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user is required'],
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Allocating user is required'],
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    actualReturnDate: {
      type: Date,
      default: null,
    },
    conditionAtAllocation: {
      type: String,
      default: null,
    },
    conditionAtReturn: {
      type: String,
      default: null,
    },
    conditionNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Allocation', allocationSchema);
