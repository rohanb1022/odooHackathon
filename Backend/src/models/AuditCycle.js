const mongoose = require('mongoose');

const auditCycleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Audit cycle title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    scopeType: {
      type: String,
      enum: ['department', 'location', 'all'],
      required: [true, 'Scope type is required'],
    },
    scopeValue: {
      // Department ID or location string
      type: String,
      default: null,
    },
    dateRangeStart: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dateRangeEnd: {
      type: Date,
      required: [true, 'End date is required'],
    },
    auditorIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    closedAt: {
      type: Date,
      default: null,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Auto-generated on close
    discrepancyReport: {
      totalAssets: { type: Number, default: 0 },
      verified: { type: Number, default: 0 },
      missing: { type: Number, default: 0 },
      damaged: { type: Number, default: 0 },
      generatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditCycle', auditCycleSchema);
