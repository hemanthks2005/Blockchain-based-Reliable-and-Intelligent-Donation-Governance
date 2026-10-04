import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    donorName: {
      type: String,
      default: 'Anonymous Donor',
    },
    donorEmail: {
      type: String,
      default: '',
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundRequest',
      required: true,
      index: true,
    },
    requestTitle: {
      type: String,
      default: '',
    },
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
      index: true,
    },
    beneficiaryName: {
      type: String,
      default: '',
    },
    beneficiaryAddress: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountEth: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'ETH',
    },
    status: {
      type: String,
      enum: [
        'CREATED',
        'SUBMITTED',
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'ALLOCATED',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
      ],
      default: 'CREATED',
      index: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      default: null,
    },
    blockchainTxHash: {
      type: String,
      index: true,
      sparse: true,
      default: null,
    },
    onChainDonationId: {
      type: Number,
      default: null,
    },
    blockchainNetwork: {
      type: String,
      default: 'EVM (Chain 1337)',
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    gasUsed: {
      type: String,
      default: null,
    },
    contractAddress: {
      type: String,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    timeline: [
      {
        event: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        details: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ requestId: 1, status: 1 });
donationSchema.index({ beneficiaryId: 1, status: 1 });
donationSchema.index({ status: 1, createdAt: -1 });

export const Donation = mongoose.model('Donation', donationSchema);
