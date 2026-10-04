import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { logger } from '../utils/logger.js';

// Seed demo users for immediate developer testability in memory if MongoDB is disconnected
const inMemoryUsers = new Map();

async function seedDefaultUsers() {
  if (inMemoryUsers.size === 0) {
    const defaultPasswordHash = await hashPassword('StrongPassword123');
    const demoAccounts = [
      {
        _id: '67abc1234567890123456781',
        name: 'Hemanth Donor',
        email: 'donor@bridge.org',
        passwordHash: defaultPasswordHash,
        role: 'DONOR',
        walletAddress: '0x71C95911E9A5D330f4D621457224213B443d348a',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456782',
        name: 'ABC Foundation',
        email: 'beneficiary@bridge.org',
        passwordHash: defaultPasswordHash,
        role: 'BENEFICIARY',
        walletAddress: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: '67abc1234567890123456783',
        name: 'System Governance Admin',
        email: 'admin@bridge.org',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const acc of demoAccounts) {
      inMemoryUsers.set(acc.email.toLowerCase(), acc);
    }
  }
}

// Initial seed
seedDefaultUsers().catch((err) => logger.warn('Error seeding memory users:', err.message));

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function registerUser({ name, email, password, role, walletAddress }) {
  const normalizedEmail = email.toLowerCase().trim();

  if (isDbConnected()) {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      error.code = 'USER_ALREADY_EXISTS';
      throw error;
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: role || 'DONOR',
      walletAddress: walletAddress || null,
      status: 'ACTIVE',
    });

    const accessToken = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    return {
      userId: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      walletAddress: newUser.walletAddress,
      accessToken,
    };
  } else {
    // In-memory fallback
    await seedDefaultUsers();
    if (inMemoryUsers.has(normalizedEmail)) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      error.code = 'USER_ALREADY_EXISTS';
      throw error;
    }

    const passwordHash = await hashPassword(password);
    const userId = new mongoose.Types.ObjectId().toString();
    const newUser = {
      _id: userId,
      name,
      email: normalizedEmail,
      passwordHash,
      role: role || 'DONOR',
      walletAddress: walletAddress || null,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoryUsers.set(normalizedEmail, newUser);

    const accessToken = generateToken({
      id: userId,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      walletAddress: newUser.walletAddress,
      accessToken,
    };
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();
  let user;

  if (isDbConnected()) {
    user = await User.findOne({ email: normalizedEmail });
  } else {
    await seedDefaultUsers();
    user = inMemoryUsers.get(normalizedEmail);
  }

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
    const error = new Error(`Account is currently ${user.status.toLowerCase()}. Contact administrator.`);
    error.statusCode = 403;
    error.code = 'ACCOUNT_DISABLED';
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const userId = user._id ? user._id.toString() : user.id;

  const accessToken = generateToken({
    id: userId,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress || null,
      status: user.status || 'ACTIVE',
    },
  };
}

export async function getUserById(id) {
  if (isDbConnected()) {
    const user = await User.findById(id).select('-passwordHash');
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      status: user.status,
      createdAt: user.createdAt,
    };
  } else {
    for (const u of inMemoryUsers.values()) {
      if ((u._id ? u._id.toString() : u.id) === id.toString()) {
        return {
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          walletAddress: u.walletAddress,
          status: u.status,
          createdAt: u.createdAt,
        };
      }
    }
    return null;
  }
}
