/**
 * 🤵 AUTH CONTROLLER
 * * PURPOSE:
 * Handles User Login verification and session token generation.
 * * SCOPE:
 * - login(req, res):
 * 1. Get email/password from req.body.
 * 2. Ask userRepo for the user.
 * 3. Check if password matches (using hash comparison).
 * 4. If Match: Generate token, store in sessions table, return token to client.
 * 5. If No Match: Return 401 Error.
 * * RELATION:
 * - Imports: user.repo, security utils, session.repo
 * - Used by: auth routes
 */

import { findUserByEmail } from "../../modules/users/user.repo.js";
import { verifyPassword, generateToken } from "../../utils/security.utils.js";
import {
  createSession,
  deleteSession,
} from "../../modules/auth/session.repo.js";

/**
 * Handles user login by verifying credentials and generating a session token.
 * @param {Object} req - Express request object with email and password in body.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with user data, token, or error.
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

    // Security: We use the exact same error message for "User Not Found"
    // and "Wrong Password" to prevent User Enumeration.
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken();

    // Store token in sessions table (expires in 7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    createSession(user.id, token, expiresAt);

    // Set auth cookie so browser sends it on subsequent requests
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // set true when serving over HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Return user data (excluding password_hash) and token
    const { password_hash, ...userWithoutPassword } = user;
    const normalizedRole = (user.role || "").toLowerCase();
    const userResponse = { ...userWithoutPassword, role: normalizedRole };

    return res.status(200).json({
      message: "Login successful",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.sendStatus(500);
  }
};

/**
 * Handles user logout by invalidating the session token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response confirming logout.
 */
export const logout = (req, res) => {
  try {
    // We strictly use the cookie for logout
    const token = req.cookies ? req.cookies.auth_token : null;

    // Security: Always clear the cookie in the browser, regardless of DB state
    res.clearCookie("auth_token", { path: "/" });

    // If a token existed, remove it from DB.
    // If no token existed, we still return 200 to avoid leaking information about whether the user was actually logged in.
    if (token) {
      deleteSession(token);
    }

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);

    return res.sendStatus(500);
  }
};
