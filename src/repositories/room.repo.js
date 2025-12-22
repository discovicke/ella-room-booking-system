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

export const getRoomByRoomNumber = (roomNumber) => {
    return db.prepare("SELECT * FROM rooms WHERE room_number = ?").get(roomNumber);
};

export const getRoomsByType = (type) => {
    return db.prepare("SELECT * FROM rooms WHERE type = ?").all(type);
};

export const getRoomsByLocation = (location) => {
    return db.prepare("SELECT * FROM rooms WHERE location = ?").all(location);
};


/**
 ===================
    Room Assets
 ===================
 **/

export const getAssetsByRoomId = (roomId) => {
    return db.prepare("SELECT * FROM room_assets WHERE room_id = ?").all(roomId);
};

export const getAssetById = (assetId) => {
    return db.prepare("SELECT * FROM room_assets WHERE id = ?").get(assetId);
};

/**
 ===================
 Room with Assets (JOIN)
 ===================
 **/

export const getRoomWithAssets = (roomId) => {
    const room = getRoomById(roomId);
    if (!room) return null;

    const assets = getAssetsByRoomId(roomId);
    return { ...room, assets };
};

export const getAllRoomsWithAssets = () => {
    const rooms = getAllRooms();
    return rooms.map(room => ({
        ...room,
        assets: getAssetsByRoomId(room.id)
    }));
};