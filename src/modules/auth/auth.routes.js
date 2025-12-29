/**
 * 📜 AUTH ROUTES
 * * PURPOSE:
 * Maps URL paths to Controller functions for Authentication.
 * * SCOPE:
 * - POST /login  ->  authController.login
 * * RELATION:
 * - Imports: 'src/controllers/auth.controller.js'
 * - Imported by: 'src/app.js'
 */

import express from "express";
import { login, logout } from "../../modules/auth/auth.controller.js";
import { authenticate } from "../../middleware/authentication.middleware.js";

const authRouter = express.Router();

// POST /api/auth/login - Validate user credentials
authRouter.post("/login", login);

// DELETE /api/auth/logout - Invalidate session token
authRouter.delete("/logout", authenticate, logout);

export default authRouter;
