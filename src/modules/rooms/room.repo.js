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

import { db } from "../../db/db.js";

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
  return db
    .prepare("SELECT * FROM rooms WHERE room_number = ?")
    .get(roomNumber);
};

export const getRoomsByType = (type) => {
  return db.prepare("SELECT * FROM rooms WHERE type = ?").all(type);
};

export const getRoomsByLocation = (location) => {
  return db.prepare("SELECT * FROM rooms WHERE location = ?").all(location);
};

export const createRoom = (roomData) => {
  const stmt = db.prepare(`
        INSERT INTO rooms (room_number, type, capacity, location, floor_number)
        VALUES (?, ?, ?, ?, ?)
    `);

  const info = stmt.run(
    roomData.room_number,
    roomData.type,
    roomData.capacity,
    roomData.location,
    roomData.floor_number
  );

  return getRoomById(info.lastInsertRowid);
};

export const updateRoom = (roomId, roomData) => {
  const stmt = db.prepare(`
        UPDATE rooms
        SET room_number = ?,
            type = ?,
            capacity = ?,
            location = ?,
            floor_number = ?
        WHERE id = ?
    `);

  return stmt.run(
    roomData.room_number,
    roomData.type,
    roomData.capacity,
    roomData.location,
    roomData.floor_number,
    roomId
  );
};

export const deleteRoom = (roomId) => {
  const stmt = db.prepare("DELETE FROM rooms WHERE id = ?");
  return stmt.run(roomId);
};

/**
 ===================
    Room Assets
 ===================
 **/

export const getAssetsByRoomId = (roomId) => {
  const assets = db
    .prepare("SELECT * FROM room_assets WHERE room_id = ?")
    .all(roomId);
  return assets.map((a) => ({ ...a }));
};

export const getAssetById = (assetId) => {
  const row = db.prepare("SELECT * FROM room_assets WHERE id = ?").get(assetId);
  return row ? { ...row } : row;
};

export const createRoomAsset = (assetData) => {
  const stmt = db.prepare(`
        INSERT INTO room_assets (room_id, asset)
        VALUES (?, ?)
    `);

  const info = stmt.run(assetData.room_id, assetData.asset);
  return getAssetById(info.lastInsertRowid);
};

export const updateRoomAsset = (assetId, assetData) => {
  const stmt = db.prepare(`
        UPDATE room_assets
        SET room_id = ?,
            asset = ?
        WHERE id = ?
    `);

  stmt.run(assetData.room_id, assetData.asset, assetId);
  return getAssetById(assetId);
};

export const deleteRoomAsset = (assetId) => {
  const stmt = db.prepare("DELETE FROM room_assets WHERE id = ?");
  return stmt.run(assetId);
};

export const deleteAllAssetsByRoomId = (roomId) => {
  const stmt = db.prepare("DELETE FROM room_assets WHERE room_id = ?");
  return stmt.run(roomId);
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
  return rooms.map((room) => ({
    ...room,
    assets: getAssetsByRoomId(room.id),
  }));
};
