import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../models/User.js';
import { Beneficiary } from '../models/Beneficiary.js';
import { FundRequest } from '../models/FundRequest.js';
import { Donation } from '../models/Donation.js';
import { Transaction } from '../models/Transaction.js';
import { AuditLog } from '../models/AuditLog.js';
import { hashPassword } from '../utils/auth.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bridge_db';

export async function seedDatabase() {
  console.log('\n======================================================');
  console.log(' 🌱 BRIDGE System Seed & Demo Data Initializer');
  console.log('======================================================');

  let dbConnected = false;
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    dbConnected = true;
    console.log(`✅ Successfully connected to MongoDB at: ${MONGODB_URI}`);
  } catch (err) {
    console.log(`ℹ️ MongoDB not available at ${MONGODB_URI} (${err.message}).`);
    console.log('⚡ The application is utilizing the dual-mode resilient in-memory store.');
    console.log('⚡ Demo credentials and sample entities are already pre-loaded into runtime memory.\n');
  }

  const defaultPassword = 'StrongPassword123';
  const passwordHash = await hashPassword(defaultPassword);

  const demoUsers = [
    {
      _id: new mongoose.Types.ObjectId('67abc1234567890123456781'),
      name: 'Hemanth Donor',
      email: 'donor@bridge.org',
      passwordHash,
      role: 'DONOR',
      walletAddress: '0x71C95911E9A5D330f4D621457224213B443d348a',
      status: 'ACTIVE',
    },
    {
      _id: new mongoose.Types.ObjectId('67abc1234567890123456782'),
      name: 'ABC Children Foundation',
      email: 'beneficiary@bridge.org',
      passwordHash,
      role: 'BENEFICIARY',
      walletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      status: 'ACTIVE',
    },
    {
      _id: new mongoose.Types.ObjectId('67abc1234567890123456783'),
      name: 'System Governance Admin',
      email: 'admin@bridge.org',
      passwordHash,
      role: 'ADMIN',
      walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
      status: 'ACTIVE',
    },
    {
      _id: new mongoose.Types.ObjectId('67abc1234567890123456785'),
      name: 'Global Water Initiative',
      email: 'water@bridge.org',
      passwordHash,
      role: 'BENEFICIARY',
      walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      status: 'ACTIVE',
    },
  ];

  if (dbConnected) {
    try {
      console.log('🔄 Seeding MongoDB collections...');

      // Seed Users
      for (const u of demoUsers) {
        await User.findByIdAndUpdate(u._id, u, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${demoUsers.length} Users`);

      // Seed Beneficiaries
      const demoBeneficiaries = [
        {
          _id: new mongoose.Types.ObjectId('67abc1234567890123456791'),
          userId: demoUsers[1]._id,
          name: 'NGO Hope & Children Trust',
          description: 'Education, nutrition, and emergency health aid for underprivileged youth',
          contactEmail: 'contact@ngohope.org',
          contactPhone: '+1 (555) 234-5678',
          verificationStatus: 'VERIFIED',
          verificationRemarks: 'Official registered 501(c)(3) documentation and bank audit verified',
          verifiedBy: demoUsers[2]._id,
          verifiedAt: new Date(Date.now() - 30 * 86400000),
        },
        {
          _id: new mongoose.Types.ObjectId('67abc1234567890123456792'),
          userId: demoUsers[3]._id,
          name: 'Care & Emergency Medical Aid',
          description: 'Critical surgical care, disaster response, and medicine distribution',
          contactEmail: 'support@carefoundation.org',
          contactPhone: '+1 (555) 876-5432',
          verificationStatus: 'VERIFIED',
          verificationRemarks: 'Medical license and logistics infrastructure verified by Governance Board',
          verifiedBy: demoUsers[2]._id,
          verifiedAt: new Date(Date.now() - 15 * 86400000),
        },
      ];

      for (const b of demoBeneficiaries) {
        await Beneficiary.findByIdAndUpdate(b._id, b, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${demoBeneficiaries.length} Beneficiaries`);

      // Seed Fund Requests
      const demoRequests = [
        {
          _id: new mongoose.Types.ObjectId('67abc1234567890123456801'),
          beneficiaryId: demoBeneficiaries[0]._id,
          title: 'Education for Every Child',
          description: 'Provide quality digital education, STEM books, and solar study lamps to 500 rural children.',
          purpose: 'STEM Educational equipment, textbooks, and remote digital learning tablets',
          requestedAmount: 1000000,
          approvedAmount: 1000000,
          collectedAmount: 250000,
          collectedEth: 0.1,
          status: 'APPROVED',
          reviewedBy: demoUsers[2]._id,
          reviewRemarks: 'Curriculum and budget breakdown verified',
          reviewedAt: new Date(Date.now() - 14 * 86400000),
        },
        {
          _id: new mongoose.Types.ObjectId('67abc1234567890123456802'),
          beneficiaryId: demoBeneficiaries[1]._id,
          title: 'Emergency Pediatric Surgery Aid',
          description: 'Subsidize critical heart and orthopedic surgeries for children from low-income families.',
          purpose: 'Operating theater fees, surgical consumables, and post-op rehabilitation',
          requestedAmount: 800000,
          approvedAmount: 800000,
          collectedAmount: 150000,
          collectedEth: 0.06,
          status: 'APPROVED',
          reviewedBy: demoUsers[2]._id,
          reviewRemarks: 'Hospital partnership and ethical review cleared',
          reviewedAt: new Date(Date.now() - 7 * 86400000),
        },
        {
          _id: new mongoose.Types.ObjectId('67abc1234567890123456803'),
          beneficiaryId: demoBeneficiaries[0]._id,
          title: 'Clean Water Borehole Project',
          description: 'Install deep solar borehole water wells providing 2,000 villagers daily access to potable water.',
          purpose: 'Deep drilling, solar submersible pumps, and sand filtration tanks',
          requestedAmount: 600000,
          approvedAmount: 600000,
          collectedAmount: 50000,
          collectedEth: 0.02,
          status: 'APPROVED',
          reviewedBy: demoUsers[2]._id,
          reviewRemarks: 'Hydrogeological survey reviewed and approved',
          reviewedAt: new Date(Date.now() - 3 * 86400000),
        },
      ];

      for (const r of demoRequests) {
        await FundRequest.findByIdAndUpdate(r._id, r, { upsert: true, new: true });
      }
      console.log(`  ✓ Seeded ${demoRequests.length} Fund Requests`);

      // Seed Donations & Transactions
      const demoDonations = [
        {
          _id: new mongoose.Types.ObjectId('67abc1234567890123456811'),
          donorId: demoUsers[0]._id,
          donorName: 'Hemanth Donor',
          donorEmail: 'donor@bridge.org',
          requestId: demoRequests[0]._id,
          requestTitle: demoRequests[0].title,
          beneficiaryId: demoBeneficiaries[0]._id,
          beneficiaryName: demoBeneficiaries[0].name,
          beneficiaryAddress: demoUsers[1].walletAddress,
          amount: 250000,
          amountEth: 0.1,
          currency: 'ETH',
          status: 'CONFIRMED',
          walletAddress: demoUsers[0].walletAddress,
          blockchainTxHash: '0x9a8f4c2b1e7d3a5689c0b1e4f3a2d5e789c0b1e4f3a2d5e789c0b1e4f3a2d5e7',
          onChainDonationId: 1001,
          blockchainNetwork: 'EVM Localhost (1337)',
          blockNumber: 1042,
          gasUsed: '48,210 gas',
          contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          confirmedAt: new Date(Date.now() - 2 * 86400000),
          timeline: [
            { event: 'Pledge Created', timestamp: new Date(Date.now() - 2 * 86400000 - 30000), details: 'Donation pledge of 0.1 ETH initiated' },
            { event: 'Smart Contract Invocation', timestamp: new Date(Date.now() - 2 * 86400000 - 15000), details: 'Transaction submitted to EVM mempool' },
            { event: 'Block Inscription Confirmed', timestamp: new Date(Date.now() - 2 * 86400000), details: 'Mined in Block #1042 with 12 network confirmations' },
          ],
        },
      ];

      for (const d of demoDonations) {
        await Donation.findByIdAndUpdate(d._id, d, { upsert: true, new: true });
        await Transaction.findOneAndUpdate(
          { txHash: d.blockchainTxHash },
          {
            donationId: d._id,
            txHash: d.blockchainTxHash,
            fromAddress: d.walletAddress,
            toAddress: d.beneficiaryAddress,
            amount: d.amountEth,
            blockNumber: d.blockNumber,
            status: 'CONFIRMED',
            gasUsed: d.gasUsed,
            network: 'ganache',
            timestamp: d.confirmedAt,
          },
          { upsert: true }
        );
      }
      console.log(`  ✓ Seeded ${demoDonations.length} Blockchain-verified Donations & Transactions`);

      // Seed Audit Logs
      const demoAuditLogs = [
        {
          actorId: demoUsers[2]._id,
          actorRole: 'ADMIN',
          action: 'BENEFICIARY_VERIFIED',
          entityType: 'Beneficiary',
          entityId: demoBeneficiaries[0]._id,
          metadata: { beneficiaryName: demoBeneficiaries[0].name, remarks: 'Audit verified' },
          ipAddress: '127.0.0.1',
          timestamp: new Date(Date.now() - 30 * 86400000),
        },
        {
          actorId: demoUsers[2]._id,
          actorRole: 'ADMIN',
          action: 'FUND_REQUEST_APPROVED',
          entityType: 'FundRequest',
          entityId: demoRequests[0]._id,
          metadata: { title: demoRequests[0].title, approvedAmount: 1000000 },
          ipAddress: '127.0.0.1',
          timestamp: new Date(Date.now() - 14 * 86400000),
        },
        {
          actorId: demoUsers[0]._id,
          actorRole: 'DONOR',
          action: 'DONATION_BLOCKCHAIN_CONFIRMED',
          entityType: 'Donation',
          entityId: demoDonations[0]._id,
          metadata: { txHash: demoDonations[0].blockchainTxHash, blockNumber: 1042, amountEth: 0.1 },
          ipAddress: '127.0.0.1',
          timestamp: new Date(Date.now() - 2 * 86400000),
        },
      ];

      for (const log of demoAuditLogs) {
        await AuditLog.create(log);
      }
      console.log(`  ✓ Seeded ${demoAuditLogs.length} Governance Audit Logs`);
    } catch (err) {
      console.error('❌ Error seeding collections:', err.message);
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected cleanly from MongoDB.');
    }
  }

  console.log('\n======================================================');
  console.log(' 🌟 Ready for Evaluation & Final Demonstration!');
  console.log('======================================================');
  console.log(' Default Demo Credentials:');
  console.log('  - Admin:       admin@bridge.org       / StrongPassword123');
  console.log('  - Donor:       donor@bridge.org       / StrongPassword123');
  console.log('  - Beneficiary: beneficiary@bridge.org / StrongPassword123');
  console.log('  - Beneficiary: water@bridge.org       / StrongPassword123');
  console.log('======================================================\n');
}

// Direct execution support
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('Fatal seed failure:', err);
    process.exit(1);
  });
}
