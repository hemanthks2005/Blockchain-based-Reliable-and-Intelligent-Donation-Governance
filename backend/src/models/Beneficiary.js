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
    walletAddress: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: (value) => !value || /^0x[a-fA-F0-9]{40}$/.test(value),
        message: 'Enter a valid Ethereum wallet address',
      },
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
