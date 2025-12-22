/**
 * 📚 ROOM REPOSITORY
 * * PURPOSE:
 * Handles all direct communication with the "rooms" table in the database.
 * * SCOPE:
 * - Function: getAllRooms() -> SELECT * FROM rooms
 * - Function: getRoomById(id) -> SELECT * FROM rooms WHERE id = ?
 * - NO logic, validation, or HTTP handling allowed here. Just SQL.
 * * RELATION:
 * - Imports: 'src/db/query.js'
 * - Imported by: 'src/controllers/rooms.controller.js'
 */

import {db} from "../db/db.js";

/**
 ===================
    Room Queries
 ===================
 **/

export const getAllRooms = () => {
    return db.prepare("SELECT * FROM rooms").all();
};

export const getRoomById = (roomId) => {
    return db.prepare("SELECT * FROM rooms WHERE id = ?").get(roomId);
};

/**
===================
    Room Assets
===================
 **/
export const getAssetsByRoomId = (roomId) => {
    return db.prepare("SELECT * FROM room_assets WHERE room_id = ?").all(roomId);
};