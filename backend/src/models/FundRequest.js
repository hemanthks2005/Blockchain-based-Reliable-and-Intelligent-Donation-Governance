import mongoose from 'mongoose';

const fundRequestSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    approvedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    collectedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    collectedEth: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'COMPLETED',
      ],
      default: 'PENDING',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewRemarks: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

fundRequestSchema.index({ beneficiaryId: 1, status: 1 });
fundRequestSchema.index({ status: 1, createdAt: -1 });

export const FundRequest = mongoose.model('FundRequest', fundRequestSchema);
