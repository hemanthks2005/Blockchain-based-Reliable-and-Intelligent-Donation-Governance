import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donorName: {
      type: String,
      default: 'Anonymous Donor',
    },
    donorEmail: {
      type: String,
      default: '',
    },
    donorWallet: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      required: true,
      enum: [
        'MISUSE_OF_FUNDS',
        'SUSPICIOUS_ACTIVITY',
        'FAKE_DOCUMENTATION',
        'INACTION_NO_PROGRESS',
        'OTHER',
      ],
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const voteSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    donorName: {
      type: String,
      default: 'Eligible Donor',
    },
    donorWallet: {
      type: String,
      default: '',
    },
    vote: {
      type: String,
      required: true,
      enum: ['APPROVE', 'REJECT'],
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const refundItemSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    donorName: String,
    donorEmail: String,
    donorWallet: String,
    amount: Number,
    amountEth: Number,
    txHash: String,
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSED'],
      default: 'PROCESSED',
    },
    refundedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const governanceDisputeSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundRequest',
      required: true,
      unique: true,
      index: true,
    },
    campaignTitle: {
      type: String,
      required: true,
    },
    beneficiaryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Beneficiary',
      required: true,
    },
    beneficiaryName: {
      type: String,
      default: 'Beneficiary Organization',
    },
    status: {
      type: String,
      enum: [
        'ACTIVE_CAMPAIGN',
        'FROZEN_PENDING_EVIDENCE',
        'EVIDENCE_SUBMITTED',
        'VOTING_OPEN',
        'RESOLVED_APPROVED',
        'RESOLVED_REJECTED',
      ],
      default: 'ACTIVE_CAMPAIGN',
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    threshold: {
      type: Number,
      default: 2,
    },
    reports: [reportSchema],
    frozenAt: {
      type: Date,
      default: null,
    },
    freezeReason: {
      type: String,
      default: null,
    },
    evidence: {
      explanation: {
        type: String,
        default: null,
      },
      documents: [
        {
          name: String,
          url: String,
        },
      ],
      images: [
        {
          name: String,
          url: String,
        },
      ],
      videos: [
        {
          name: String,
          url: String,
        },
      ],
      submittedAt: {
        type: Date,
        default: null,
      },
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
    voting: {
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      votes: [voteSchema],
      approveWeight: {
        type: Number,
        default: 0,
      },
      rejectWeight: {
        type: Number,
        default: 0,
      },
      totalWeight: {
        type: Number,
        default: 0,
      },
      resolvedAt: {
        type: Date,
        default: null,
      },
      resolutionResult: {
        type: String,
        enum: ['APPROVED', 'REJECTED', null],
        default: null,
      },
    },
    refunds: {
      status: {
        type: String,
        enum: ['NOT_APPLICABLE', 'INITIATED', 'COMPLETED'],
        default: 'NOT_APPLICABLE',
      },
      totalRefundAmount: {
        type: Number,
        default: 0,
      },
      refundRecords: [refundItemSchema],
    },
  },
  {
    timestamps: true,
  }
);

export const GovernanceDispute = mongoose.model(
  'GovernanceDispute',
  governanceDisputeSchema
);
