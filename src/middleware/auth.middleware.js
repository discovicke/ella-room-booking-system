/* The "Bouncer". It extracts the Bearer token from the Authorization header, verifies it exists in the sessions table and hasn't expired, then attaches the user to req.user. If token is missing or invalid, it blocks the request with a 401. */

import { validateSession } from "../repositories/session.repo.js";
import { getUserById } from "../repositories/user.repo.js";

/**
 * 🛡️ AUTHENTICATION MIDDLEWARE
 * * PURPOSE:
 * Verifies Bearer token on every request and attaches authenticated user to req.user.
 * * FLOW:
 * 1. Extract Authorization header (Bearer token)
 * 2. Validate token exists in sessions table and hasn't expired
 * 3. Find user by user_id from session
 * 4. Attach user to req.user (excluding password_hash)
 * 5. Block with 401 if any step fails
 */

export const authMiddleware = (req, res, next) => {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    // Validate token in sessions table
    const session = validateSession(token);

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Find user by session's user_id
    const user = getUserById(session.user_id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
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
