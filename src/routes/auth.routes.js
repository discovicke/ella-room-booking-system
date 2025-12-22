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

const authRouter = express.Router();

authRouter.get("/", (req, res) => {
  res.send("Get all users");
});

authRouter.post("/", (req, res) => {
  res.send("Create a new user");
});

export default authRouter;
