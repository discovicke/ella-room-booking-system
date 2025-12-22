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
    const rooms = roomRepo.getAllRooms();
    return res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    return res.status(500).json({ error: "Could not fetch rooms" });
  }
};
