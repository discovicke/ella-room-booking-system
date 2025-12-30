/**
 * 📚 BOOKING REPOSITORY
 * * PURPOSE: Handles access to the "bookings" table.
 */

import { db } from "../../db/db.js";

// --- CREATE ---

export const createBooking = (bookingData) => {
  // We use Named Parameters (@key) matching the object keys
  const stmt = db.prepare(`
    INSERT INTO bookings (room_id, user_id, start_time, end_time, status, notes)
    VALUES (@room_id, @user_id, @start_time, @end_time, @status, @notes)
  `);

  return stmt.run(bookingData);
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
  return db
    .prepare("SELECT * FROM bookings WHERE start_time < ? AND end_time > ?")
    .all(searchEnd, searchStart);
};

/**
 * Checks for any bookings in the specified room that overlap with the given time range.
 * Logic: (ExistingStart < NewEnd) AND (ExistingEnd > NewStart)
 */
export const getOverlappingBookings = (roomId, startTime, endTime) => {
  return db
    .prepare(
      `
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND start_time < ? 
      AND end_time > ?
    `
    )
    .all(roomId, endTime, startTime);
};

// --- UPDATE ---

export const updateBookingById = (bookingId, bookingData) => {
  const stmt = db.prepare(`
        UPDATE bookings
        SET room_id = @room_id,
            user_id = @user_id,
            start_time = @start_time,
            end_time = @end_time,
            status = @status,
            notes = @notes
        WHERE id = @id
    `);

  // FIX:
  // Explicitly pick ONLY the fields allowed in the SQL statement.
  // This strips out 'created_at', 'updated_at', or any other junk
  // from the frontend that would cause an "Unknown named parameter" error.
  const safeData = {
    id: bookingId,
    room_id: bookingData.room_id,
    user_id: bookingData.user_id,
    start_time: bookingData.start_time,
    end_time: bookingData.end_time,
    status: bookingData.status,
    notes: bookingData.notes,
  };

  return stmt.run(safeData);
};

// --- DELETE ---

export const deleteBookingById = (bookingId) => {
  return db.prepare("DELETE FROM bookings WHERE id = ?").run(bookingId);
};

export const getAllBookingsWithRoom = () => {
  return db
    .prepare(
      `
      SELECT b.*, r.room_number AS room_number, r.location AS room_location
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
    `
    )
    .all();
};

export const getAllBookingsByUserWithRoom = (userId) => {
  return db
    .prepare(
      `
      SELECT b.*, r.room_number AS room_number, r.location AS room_location
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
    `
    )
    .all(userId);
};
