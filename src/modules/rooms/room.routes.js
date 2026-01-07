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
import * as roomController from "./room.controller.js";
import { authenticate } from "../../middleware/authentication.middleware.js";
import { authorize } from "../../middleware/authorization.middleware.js";
import { ROLES } from "../../constants/roles.js";

const roomsRouter = express.Router();

roomsRouter.get("/", authenticate, roomController.listRooms);
roomsRouter.post(
  "/",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  roomController.createRoom
);

// Room-specific
roomsRouter.get("/:id", authenticate, roomController.getRoom);
roomsRouter.put(
  "/:id",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  roomController.updateRoom
);
roomsRouter.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  roomController.deleteRoom
);

// Assets under a room
//roomsRouter.get("/:id/assets", roomController.listAssetsByRoom);

roomsRouter.post(
  "/:id/assets",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  roomController.createRoomAsset
);

// NO TIME TO IMPLEMENT CORRECTLY, SO COMMENTING OUT FOR NOW
// Assets by id
/*
roomsRouter.put(
  "/assets/:assetId",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  roomController.updateRoomAsset
);
*/

roomsRouter.delete(
  "/assets/:assetId",
  authenticate,
  authorize(ROLES.ADMIN),
  roomController.deleteRoomAsset
);

export default roomsRouter;
