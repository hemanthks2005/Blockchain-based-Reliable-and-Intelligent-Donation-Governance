import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: [
        'PENDING_VERIFICATION',
        'VERIFIED',
        'REJECTED',
        'SUSPENDED',
      ],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    verificationRemarks: {
      type: String,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

beneficiarySchema.index({ userId: 1, verificationStatus: 1 });
beneficiarySchema.index({ verificationStatus: 1, createdAt: -1 });

export const Beneficiary = mongoose.model('Beneficiary', beneficiarySchema);
