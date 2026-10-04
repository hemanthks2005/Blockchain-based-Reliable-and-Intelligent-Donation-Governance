import rateLimit from 'express-rate-limit';

// Standard rate limiter response format
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Rate limit exceeded, please try again shortly.',
      retryAfterSeconds: Math.ceil((req.rateLimit?.resetTime?.getTime() - Date.now()) / 1000) || 60,
    },
  });
};

/**
 * Sensitive Auth Rate Limiter (Login, Register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per 15m
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

/**
 * General Public API Limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15m
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/**
 * High-Value Transaction Limiter (Donations, Blockchain transactions)
 */
export const transactionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 transactions per 5m
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});
