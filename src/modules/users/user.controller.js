/**
 * 👤 USER CONTROLLER
 * * PURPOSE: Handles user management operations.
 */

import * as userRepo from "../../modules/users/user.repo.js";
import { hashPassword } from "../../utils/security.utils.js";
import { CreateUserDTO } from "./user.dto.js";

export const createUser = async (req, res) => {
  try {
    // 1. Validate & Structure Input (Fail fast if email/pass missing)
    const userDTO = new CreateUserDTO(req.body);

    // 2. Business Logic Checks (Unique Email)
    // We use the clean email from the DTO
    const existingUser = userRepo.findUserByEmail(userDTO.email);
    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    // 3. Security (Hashing)
    // The DTO holds the raw password for us to hash here
    const password_hash = await hashPassword(userDTO.password);

    // 4. Persistence
    // We pass the hash into .toStorage() so it bundles everything for the Repo
    const userId = userRepo.createUser(userDTO.toStorage(password_hash));

    // 5. Response
    const newUser = userRepo.getUserById(userId);
    const { password_hash: _, ...sanitizedUser } = newUser;

    res.status(201).json({
      message: "User created successfully",
      user: sanitizedUser,
    });
  } catch (error) {
    // Handle validation errors from the DTO
    if (
      error.message.includes("Missing") ||
      error.message.includes("Invalid")
    ) {
      return res.status(400).json({ error: error.message });
    }
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
