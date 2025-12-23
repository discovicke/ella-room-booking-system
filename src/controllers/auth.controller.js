/**
 * 🤵 AUTH CONTROLLER
 * * PURPOSE:
 * Handles User Login verification.
 * * SCOPE:
 * - login(req, res):
 * 1. Get email/password from req.body.
 * 2. Ask userRepo for the user.
 * 3. Check if password matches (using hash comparison).
 * 4. If Match: Return success so the client can store credentials.
 * 5. If No Match: Return 401 Error.
 * * RELATION:
 * - This no longer generates tokens; it simply validates credentials for the client.
 */

import { findUserByEmail } from "../repositories/user.repo.js";
import { verifyPassword } from "../utils/security.js";

/**
 * Handles user login by verifying credentials.
 * @param {Object} req - Express request object with email and password in body.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with user data or error.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user data (excluding password_hash)
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
