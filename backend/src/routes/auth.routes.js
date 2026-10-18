import { Router } from 'express';
import { register, login, getMe, updateProfile, logout } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Public routes with brute-force rate limiter
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.patch('/profile', authenticate, updateProfile);
router.put('/me', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

export default router;

