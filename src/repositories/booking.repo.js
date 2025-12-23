/**
 * 📚 BOOKING REPOSITORY
 * * PURPOSE:
 * Handles access to the "bookings" table.
 * * SCOPE:
 * - Create: createBooking
 * - Read: getBookingById, getAllBookingsByUser, getAllBookingsByRoom, getAllBookingsByDate
 * - Update: changeBookingStatusById
 * - Delete: deleteBookingById
 * * RELATION:
 * - Imports: '../db/db.js'
 * - Imported by: 'src/controllers/bookings.controller.js'
 */

import { db } from "../db/db.js";

// --- CREATE ---

export const createBooking = (bookingData) => {
  const stmt = db.prepare(`
    INSERT INTO bookings (room_id, user_id, start_time, end_time, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  return stmt.run(
    bookingData.room_id,
    bookingData.user_id,
    bookingData.start_time,
    bookingData.end_time,
    bookingData.status || "active"
  );
};

// --- READ ---

export const getBookingById = (bookingId) => {
  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);
};

export const getAllBookingsByUser = (userId) => {
  return db.prepare("SELECT * FROM bookings WHERE user_id = ?").all(userId);
};

export const getAllBookingsByRoom = (roomId) => {
  return db.prepare("SELECT * FROM bookings WHERE room_id = ?").all(roomId);
};

export const getAllBookingsByDate = (start, end) => {
  return db
    .prepare("SELECT * FROM bookings WHERE start_time >= ? AND end_time <= ?")
    .all(start, end);
};

// --- UPDATE ---

export const updateBooking = (bookingId, bookingData) => {
  const stmt = db.prepare(`
        UPDATE bookings
        SET room_id = ?,
            user_id = ?,
            start_time = ?,
            end_time = ?,
            status = ?
        WHERE id = ?
    `);

  return stmt.run(
    bookingData.room_id,
    bookingData.user_id,
    bookingData.start_time,
    bookingData.end_time,
    bookingData.status,
    bookingId
  );
};

// --- DELETE ---

export const deleteBookingById = (bookingId) => {
  return db.prepare("DELETE FROM bookings WHERE id = ?").run(bookingId);
};
