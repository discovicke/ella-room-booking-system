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
    return res.status(500)
  }
};

export const createRoom = (req, res) => {
  try {
    const { room_number, type, capacity, location, floor_number } = req.body || {};
    if (!room_number || !type) {
      return res.status(400)
    }
    return res.status(201)
  } catch (err) {
    console.error('Error creating room:', err);
    return res.status(500)
  }
};