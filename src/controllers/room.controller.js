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
    return res.status(500).send();
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
    return res.status(500).send();
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
      return res.status(400).json({ error: "Invalid room id" });
    }

    const { room_number, type, capacity, location, floor_number } = req.body || {};

    if (
        room_number === undefined &&
        type === undefined &&
        capacity === undefined &&
        location === undefined &&
        floor_number === undefined
    ) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    const roomData = { room_number, type, capacity, location, floor_number };
    roomRepo.updateRoom(id, roomData);

    const updated = roomRepo.getRoomById(id);
    if (!updated) return res.status(404).json({ error: "Room not found" });

    return res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating room:", err);
    return res.status(500).json({ error: "Could not update room" });
  }
};
