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

// =======================================
//      HEJ @ANDRÉ HEATONLOVER PONTÉN
//      START PÅ APIANROPET ÄR:
//      -----------------------
//      | localhost/api/rooms |
//      -----------------------
// =======================================

import express from "express";
import * as roomController from "../controllers/room.controller.js";

const roomsRouter = express.Router();

roomsRouter.get("/", roomController.listRooms);
roomsRouter.post("/", roomController.createRoom);

// Room-specific
roomsRouter.get("/:id", roomController.getRoom);
roomsRouter.put("/:id", roomController.updateRoom);
roomsRouter.delete("/:id", roomController.deleteRoom);

// Assets under a room
//roomsRouter.get("/:id/assets", roomController.listAssetsByRoom);
roomsRouter.post("/:id/assets", roomController.createRoomAsset);

//// Assets by id
roomsRouter.put("/assets/:assetId", roomController.updateRoomAsset);
roomsRouter.delete("/assets/:assetId", roomController.deleteRoomAsset);

export default roomsRouter;
