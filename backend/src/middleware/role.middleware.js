/**
 * Middleware to restrict access to specific roles
 * @param  {...string} roles Allowed roles ('DONOR', 'BENEFICIARY', 'ADMIN')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required prior to role verification.',
        },
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedRoles = roles.map((r) => r.toUpperCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${userRole}' is not authorized. Required: ${normalizedRoles.join(', ')}`,
        },
      });
    }

    next();
  };
}
