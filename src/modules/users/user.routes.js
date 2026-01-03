import express from "express";
import { createUser, getAllUsers, getUserById, deleteUser, updateUser } from "./user.controller.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { authorize } from "../../middleware/authorization.middleware.js";
import { ROLES } from "../../constants/roles.js";


const userRouter = express.Router();

// GET /api/users - Get all users (Admin only)
userRouter.get("/", authenticate, authorize(ROLES.ADMIN), getAllUsers);

// GET /api/users/:id - Get user by ID (Admin only)
userRouter.get("/:id", authenticate, authorize(ROLES.ADMIN), getUserById);

// POST /api/users - Create a new user (Admin only)
userRouter.post("/", authenticate, authorize(ROLES.ADMIN), createUser);

// PUT /api/users/:id - Update a user (Admin only)
userRouter.put('/:id', authenticate, authorize(ROLES.ADMIN), updateUser);

// DELETE /api/users/:id - Delete a user (Admin only)
userRouter.delete("/:id", authenticate, authorize(ROLES.ADMIN), deleteUser);

export default userRouter;
