/* Role-based authorization middleware. Checks if authenticated user has required role. Must be used AFTER authenticationMiddleware. */

/**
 * 🔐 AUTHORIZATION MIDDLEWARE FACTORY
 * PURPOSE:
 * Creates middleware that checks if req.user.role matches allowed roles.
 *
 * EXAMPLE USAGE:
 * router.get('/admin', authenticationMiddleware, authorize(ROLES.ADMIN), controller);
 * router.post('/room', authenticationMiddleware, authorize(ROLES.TEACHER, ROLES.ADMIN), controller);
 *
 * @param {...string} allowedRoles - One or more role strings from ROLES constant
 * @returns {Function} Express middleware function
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    // Ensure user is authenticated (authMiddleware should run first)
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required. Use authMiddleware before authorize()",
      });
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions.",
        required: allowedRoles,
        current: req.user.role,
      });
    }

    // User has correct role, proceed
    next();
  };
}
