/**
 * Sanitizes an object by removing NoSQL injection operators ($gt, $ne, $where, etc.)
 */
function sanitizeInput(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeInput(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    // Disallow MongoDB operators starting with $
    if (!key.startsWith('$') && !key.includes('.')) {
      clean[key] = sanitizeInput(value);
    }
  }
  return clean;
}

/**
 * Middleware: Sanitize req.body, req.query, and req.params to prevent NoSQL injection
 */
export function sanitizeRequest(req, res, next) {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
}

/**
 * Validates email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates Ethereum hex address format
 */
export function validateEthereumAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Validates positive number
 */
export function validatePositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}
