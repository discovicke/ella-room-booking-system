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
import * as roomController from "../controllers/room.controller.js";

const roomsRouter = express.Router();

roomsRouter.get("/", roomController.listRooms);

roomsRouter.post("/", roomController.createRoom);

export default roomsRouter;
