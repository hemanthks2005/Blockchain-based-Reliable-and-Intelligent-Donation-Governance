import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Beneficiary } from '../models/Beneficiary.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { logger } from '../utils/logger.js';

// Seed demo users for immediate developer testability in memory if MongoDB is disconnected
const inMemoryUsers = new Map();

async function seedDefaultUsers() {
  if (inMemoryUsers.size === 0) {
    const defaultPasswordHash = await hashPassword('StrongPassword123');
    const hemanthAdminHash = await hashPassword('Hemanthks@2005');
    const demoAccounts = [
      {
        _id: '67abc1234567890123456784',
        name: 'Hemanth K S',
        email: 'hemanthknskns2005@gmail.com',
        passwordHash: hemanthAdminHash,
        role: 'ADMIN',
        walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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
    // Auto-provision or update designated Hemanth K S admin account
    if (!user && normalizedEmail === 'hemanthknskns2005@gmail.com') {
      const passwordHash = await hashPassword('Hemanthks@2005');
      user = await User.create({
        name: 'Hemanth K S',
        email: 'hemanthknskns2005@gmail.com',
        passwordHash,
        role: 'ADMIN',
        walletAddress: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
        status: 'ACTIVE',
      });
    } else if (user && normalizedEmail === 'hemanthknskns2005@gmail.com') {
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch && password === 'Hemanthks@2005') {
        user.passwordHash = await hashPassword('Hemanthks@2005');
        user.role = 'ADMIN';
        user.name = 'Hemanth K S';
        await user.save();
      }
    }
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
      phone: user.phone || '',
      bio: user.bio || '',
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
      phone: user.phone || '',
      bio: user.bio || '',
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
          phone: u.phone || '',
          bio: u.bio || '',
          status: u.status,
          createdAt: u.createdAt,
        };
      }
    }
    return null;
  }
}

export async function updateUserProfile(userId, { name, email, walletAddress, phone, bio }) {
  const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

  if (isDbConnected()) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== userId.toString()) {
        const error = new Error('This email is already associated with another account.');
        error.statusCode = 409;
        error.code = 'EMAIL_ALREADY_IN_USE';
        throw error;
      }
      user.email = normalizedEmail;
    }

    if (name && name.trim()) user.name = name.trim();
    if (walletAddress !== undefined) user.walletAddress = walletAddress ? walletAddress.trim() : null;
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    // If role is BENEFICIARY, sync beneficiary profile
    if (user.role === 'BENEFICIARY') {
      try {
        const ben = await Beneficiary.findOne({ userId: user._id });
        if (ben) {
          if (name && name.trim()) ben.name = name.trim();
          if (user.email) ben.contactEmail = user.email;
          if (phone !== undefined) ben.contactPhone = phone.trim();
          if (bio !== undefined) ben.description = bio.trim();
          await ben.save();
        }
      } catch (err) {
        logger.warn(`Could not sync beneficiary profile: ${err.message}`);
      }
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      phone: user.phone || '',
      bio: user.bio || '',
      status: user.status,
      updatedAt: user.updatedAt,
    };
  } else {
    await seedDefaultUsers();
    let foundUser = null;
    let oldEmailKey = null;

    for (const [key, u] of inMemoryUsers.entries()) {
      const currentId = u._id ? u._id.toString() : u.id ? u.id.toString() : null;
      if (currentId === userId.toString()) {
        foundUser = u;
        oldEmailKey = key;
        break;
      }
    }

    if (!foundUser) {
      const error = new Error('User account not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    if (normalizedEmail && normalizedEmail !== foundUser.email) {
      if (inMemoryUsers.has(normalizedEmail)) {
        const error = new Error('This email is already associated with another account.');
        error.statusCode = 409;
        error.code = 'EMAIL_ALREADY_IN_USE';
        throw error;
      }
      inMemoryUsers.delete(oldEmailKey);
      foundUser.email = normalizedEmail;
    }

    if (name && name.trim()) foundUser.name = name.trim();
    if (walletAddress !== undefined) foundUser.walletAddress = walletAddress ? walletAddress.trim() : null;
    if (phone !== undefined) foundUser.phone = phone.trim();
    if (bio !== undefined) foundUser.bio = bio.trim();
    foundUser.updatedAt = new Date();

    inMemoryUsers.set(foundUser.email, foundUser);

    return {
      id: foundUser._id ? foundUser._id.toString() : foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      walletAddress: foundUser.walletAddress,
      phone: foundUser.phone || '',
      bio: foundUser.bio || '',
      status: foundUser.status,
      updatedAt: foundUser.updatedAt,
    };
  }
}
