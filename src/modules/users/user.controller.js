/**
 * 👤 USER CONTROLLER
 * * PURPOSE:
 * Handles user management operations.
 * * SCOPE:
 * - createUser(req, res): Create a new user with hashed password
 * - getAllUsers(req, res): Get all users
 * - getUserById(req, res): Get user by ID
 * * RELATION:
 * - Imports: 'src/repositories/user.repo.js', 'src/utils/security.utils.js'
 */

import * as userRepo from "../../modules/users/user.repo.js";
import { hashPassword } from "../../utils/security.utils.js";

export const createUser = async (req, res) => {
  try {
    const { email, password, role, Display_name, class: userClass } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = userRepo.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Create user
    const userId = userRepo.createUser({
      email,
      password_hash,
      role: role || "student",
      Display_name: Display_name || email.split("@")[0],
      class: userClass || null,
    });

    // Get the created user
    const newUser = userRepo.getUserById(userId);

    // Remove password_hash from response
    const { password_hash: _, ...sanitizedUser } = newUser;

    res.status(201).json({
      message: "User created successfully",
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = (req, res) => {
  try {
    const users = userRepo.getAllUsers();

    // Remove password_hash from all users
    const sanitizedUsers = users.map(({ password_hash, ...user }) => user);

    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = (req, res) => {
  try {
    const { id } = req.params;

    const user = userRepo.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password_hash from response
    const { password_hash, ...sanitizedUser } = user;

    res.status(200).json(sanitizedUser);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
