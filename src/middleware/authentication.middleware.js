import { validateSession } from "../modules/auth/session.repo.js";
import { getUserById } from "../modules/users/user.repo.js";

/**
 * 🛡️ AUTHENTICATION MIDDLEWARE
 *
 * * PURPOSE:
 * Verifies the identity of the user for protected routes.
 *
 * * STRATEGY: Cookies Only
 * 1. 🍪 Cookies: Checks for 'auth_token' in HTTP-Only cookies.
 * - Why? Best for Browsers. Secure against XSS (if HttpOnly).
 * - No Header Fallback: We strictly enforce cookies for better security consistency.
 */

export const authenticate = (req, res, next) => {
  try {
    // 1. Check Cookie
    const token = req.cookies ? req.cookies.auth_token : null;

    // 🛑 No token found
    if (!token) {
      // If user is browsing a page (not an API), redirect them
      if (req.accepts("html") && !req.path.startsWith("/api/")) {
        return res.redirect("/login");
      }
      return res.status(401).json({ error: "Missing authentication token" });
    }

    const session = validateSession(token);
    if (!session) {
      if (req.accepts("html") && !req.path.startsWith("/api/"))
        return res.redirect("/login");
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = getUserById(session.user_id);
    if (!user) {
      if (req.accepts("html") && !req.path.startsWith("/api/"))
        return res.redirect("/login");
      return res.status(401).json({ error: "User not found" });
    }

    const { password_hash, ...userWithoutPassword } = user;
    // Normalize role to lowercase to match allowedRoles constants
    req.user = {
      ...userWithoutPassword,
      role: (user.role || "").toLowerCase(),
    };
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
