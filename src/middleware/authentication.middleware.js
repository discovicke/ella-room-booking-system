import { validateSession } from "../modules/auth/session.repo.js";
import { getUserById } from "../modules/users/user.repo.js";

/**
 * 🛡️ AUTHENTICATION MIDDLEWARE
 *
 * * PURPOSE:
 * Verifies the identity of the user for protected routes.
 *
 * * HYBRID AUTH STRATEGY (Cookie + Header):
 * 1. 🍪 Cookies (Priority): Checks for 'auth_token' in HTTP-Only cookies first.
 * - Why? Best for Browsers. It renders the app immune to XSS attacks because
 * JavaScript cannot read the token. It also simplifies the frontend code, which is the real reason we want this.
 *
 * 2. 🔑 Headers (Fallback): Checks for 'Authorization: Bearer <token>' second.
 * - Why? Because cookies are not handled automatically by API clients like Postman or cURL. This fallback allows us developers to test the API easily by
 * manually setting the Authorization header.
 */

export const authenticate = (req, res, next) => {
  try {
    let token = null;

    // 1. Check Cookie (Priority)
    if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    // 2. Check Header (Fallback for Postman)
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

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
