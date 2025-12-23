/**
 * 📚 BOOKING REPOSITORY
 * * PURPOSE: Handles access to the "bookings" table.
 * * SCOPE: Create, Read, Update, Delete
 */

import { db } from "../db/db.js";

// --- CREATE ---

export const createBooking = (bookingData) => {
  const stmt = db.prepare(`
    INSERT INTO bookings (room_id, user_id, start_time, end_time, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    bookingData.room_id,
    bookingData.user_id,
    bookingData.start_time,
    bookingData.end_time,
    bookingData.status,
    bookingData.notes // Cleaned by controller, safe to insert
  );
};

// --- READ ---

export const getAllBookings = () => {
  return db.prepare("SELECT * FROM bookings").all();
};

export const getBookingById = (bookingId) => {
  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(bookingId);
};

export const getAllBookingsByUser = (userId) => {
  return db.prepare("SELECT * FROM bookings WHERE user_id = ?").all(userId);
};

export const getAllBookingsByRoom = (roomId) => {
  return db.prepare("SELECT * FROM bookings WHERE room_id = ?").all(roomId);
};

export const getAllBookingsByDate = (searchStart, searchEnd) => {
  // Finds ANY overlap.
  // Logic: Booking starts before search ends AND Booking ends after search starts.
  return db
    .prepare("SELECT * FROM bookings WHERE start_time < ? AND end_time > ?")
    .all(searchEnd, searchStart);
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
