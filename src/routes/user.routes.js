import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// GET /api/users - Get all users
userRouter.get("/", getAllUsers);

// GET /api/users/:id - Get user by ID
userRouter.get("/:id", getUserById);

// POST /api/users - Create a new user
userRouter.post("/", createUser);

export default userRouter;
