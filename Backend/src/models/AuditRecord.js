const mongoose = require('mongoose');

const auditRecordSchema = new mongoose.Schema(
  {
    auditCycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuditCycle',
      required: [true, 'Audit cycle is required'],
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    auditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Auditor is required'],
    },
    result: {
      type: String,
      enum: ['Verified', 'Missing', 'Damaged'],
      required: [true, 'Audit result is required'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One record per asset per audit cycle
auditRecordSchema.index({ auditCycleId: 1, assetId: 1 }, { unique: true });

module.exports = mongoose.model('AuditRecord', auditRecordSchema);
