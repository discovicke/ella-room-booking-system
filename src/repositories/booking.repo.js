/**
 * 📚 BOOKING REPOSITORY
 * * PURPOSE: Handles access to the "bookings" table.
 */

import { db } from "../db/db.js";

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

  // We merge the 'id' into the object so it binds to @id
  return stmt.run({ ...bookingData, id: bookingId });
};

// --- DELETE ---

export const deleteBookingById = (bookingId) => {
  return db.prepare("DELETE FROM bookings WHERE id = ?").run(bookingId);
};
