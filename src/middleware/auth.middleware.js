/* The "Bouncer". It decodes the Basic Auth header, verifies the email and password against the DB, and attaches the user to req.user. If credentials are missing or invalid, it blocks the request with a 401. */

import { decodeBasicAuth, verifyPassword } from "../utils/security.js";
import { findUserByEmail } from "../repositories/user.repo.js";

/**
 * 🛡️ AUTHENTICATION MIDDLEWARE
 * * PURPOSE:
 * Verifies Basic Auth credentials on every request and attaches authenticated user to req.user.
 * * FLOW:
 * 1. Extract Authorization header
 * 2. Decode Basic Auth credentials (email:password)
 * 3. Find user in database by email
 * 4. Verify password hash
 * 5. Attach user to req.user (excluding password_hash)
 * 6. Block with 401 if any step fails
 */

export const authMiddleware = async (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }

    // Decode Basic Auth
    const credentials = decodeBasicAuth(authHeader);

    if (!credentials) {
      return res
        .status(401)
        .json({ error: "Invalid Authorization header format" });
    }

    const { email, password } = credentials;

    // Find user in database
    const user = findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Attach user to request (exclude password_hash for security)
    const { password_hash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
