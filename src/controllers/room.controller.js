/**
 * 🤵 ROOM CONTROLLER
 * * PURPOSE:
 * Handles incoming HTTP requests for Room data.
 * * SCOPE:
 * - listRooms(req, res):
 * 1. Call roomRepo.getAllRooms()
 * 2. Send response: res.json(data)
 * * RELATION:
 * - Imports: 'src/repositories/room.repo.js'
 * - Imported by: 'src/routes/rooms.routes.js'
 */

import * as roomRepo from "../repositories/room.repo.js";

/**
 * GET /rooms
 * Returns all rooms from the repository as JSON
 */
export const listRooms = (req, res) => {
  try {
    const includeAssets = req.query.includeAssets === 'true';
    const rooms = includeAssets
        ? roomRepo.getAllRoomsWithAssets()
        : roomRepo.getAllRooms();
    return res.status(200).json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    return res.sendStatus(500);
  }
};

export const createRoom = (req, res) => {
  try {
    const { room_number, type, capacity, location, floor_number } = req.body || {};
    if (!room_number || !type) {
      return res.status(400).send();
    }
    roomRepo.createRoom({ room_number, type, capacity, location, floor_number });
    return res.status(201).send();
  } catch (err) {
    console.error('Error creating room:', err);
    return res.sendStatus(500);
  }
};

export const getRoom = (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const includeAssets = req.query.includeAssets === 'true';
    const room = includeAssets
        ? roomRepo.getRoomWithAssets(id)
        : roomRepo.getRoomById(id);

    if (!room) return res.sendStatus(404);

    return res.status(200).json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    return res.sendStatus(500);
  }
};


export const updateRoom = (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400)
    }

    const { room_number, type, capacity, location, floor_number } = req.body || {};

    if (
        room_number === undefined &&
        type === undefined &&
        capacity === undefined &&
        location === undefined &&
        floor_number === undefined
    ) {
      return res.sendStatus(400);
    }

    const roomData = { room_number, type, capacity, location, floor_number };
    roomRepo.updateRoom(id, roomData);

    const updated = roomRepo.getRoomById(id);
    if (!updated) return res.sendStatus(404);

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating room:", err);
    return res.sendStatus(500);
  }
};

export const deleteRoom = (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.sendStatus(400);
    }

    const result = roomRepo.deleteRoom(id);
    if (!result || result.changes === 0) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting room:", err);
    return res.sendStatus(500);
  }
};

export const createRoomAsset = (req, res) => {
  try {
    const roomId = Number(req.params.id);
    if (!Number.isInteger(roomId) || roomId <= 0) {
      return res.sendStatus(400);
    }

    const { asset } = req.body || {};
    if (!asset) {
      return res.sendStatus(400);
    }

    const room = roomRepo.getRoomById(roomId);
    if (!room) return res.sendStatus(404);

    roomRepo.createRoomAsset({ room_id: roomId, asset });

    return res.sendStatus(201);
  } catch (err) {
    console.error("Error creating room asset:", err);
    return res.sendStatus(500);
  }
};

// javascript
export const updateRoomAsset = (req, res) => {
  try {
    const assetId = Number(req.params.assetId);
    if (!Number.isInteger(assetId) || assetId <= 0) {
      return res.sendStatus(400);
    }

    const { asset, room_id } = req.body || {};
    if (asset === undefined && room_id === undefined) {
      return res.sendStatus(400);
    }

    const existing = roomRepo.getAssetById(assetId);
    if (!existing) return res.sendStatus(404);

    let newRoomId = existing.room_id;
    if (room_id !== undefined) {
      const parsedRoomId = Number(room_id);
      if (!Number.isInteger(parsedRoomId) || parsedRoomId <= 0) {
        return res.sendStatus(400);
      }
      const room = roomRepo.getRoomById(parsedRoomId);
      if (!room) return res.sendStatus(404);
      newRoomId = parsedRoomId;
    }

    roomRepo.updateRoomAsset(assetId, {
      room_id: newRoomId,
      asset: asset !== undefined
          ? asset
          : existing.asset
    });

    return res.sendStatus(200);
  } catch (err) {
    console.error("Error updating room asset:", err);
    return res.sendStatus(500);
  }
};

export const deleteRoomAsset = (req, res) => {
  try {
    const assetId = Number(req.params.assetId);
    if (!Number.isInteger(assetId) || assetId <= 0) {
      return res.sendStatus(400);
    }

    const existing = roomRepo.getAssetById(assetId);
    if (!existing) return res.sendStatus(404);

    const result = roomRepo.deleteRoomAsset(assetId);
    if (!result || result.changes === 0) {
      return res.sendStatus(404);
    }

    return res.sendStatus(204);
  } catch (err) {
    console.error("Error deleting room asset:", err);
    return res.sendStatus(500);
  }
};



