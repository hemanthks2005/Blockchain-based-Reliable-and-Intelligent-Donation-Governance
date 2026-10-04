import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
      index: true,
    },
    txHash: {
      type: String,
      unique: true,
      sparse: true,
    },
    fromAddress: {
      type: String,
      required: true,
      trim: true,
    },
    toAddress: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'CONFIRMED', 'FAILED'],
      default: 'SUBMITTED',
      index: true,
    },
    gasUsed: {
      type: String,
      default: null,
    },
    network: {
      type: String,
      default: 'ganache',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ donationId: 1, status: 1 });
transactionSchema.index({ status: 1, timestamp: -1 });

export const Transaction = mongoose.model('Transaction', transactionSchema);
