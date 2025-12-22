/**
 * 📜 ROOM ROUTES
 * * PURPOSE:
 * Maps URL paths to specific Controller functions for Rooms.
 * * SCOPE:
 * - GET /  ->  roomController.listRooms
 * * RELATION:
 * - Imports: 'src/controllers/rooms.controller.js'
 * - Imported by: 'src/app.js'
 */

import express from "express";

const roomsRouter = express.Router();

roomsRouter.get("/", (req, res) => {
  res.send("Get all rooms");
});

roomsRouter.post("/", (req, res) => {
  res.send("Create a new room");
});

export default roomsRouter;
