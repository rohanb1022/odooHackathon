const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
    },
    description: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    photo: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Resolution notes cannot exceed 2000 characters'],
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
