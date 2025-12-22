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

/**
 * Creates a new booking in the database.
 * @param {number} roomId - The ID of the room being booked.
 * @param {number} userId - The ID of the user making the booking.
 * @param {string} start - The start date and time of the booking in ISO 8601 format.
 * @param {string} end - The end date and time of the booking in ISO 8601 format.
 * @returns {object} The result of the creation operation.
 */
export const createBooking = (roomId, userId, start, end) => {
  return db
    .prepare(
      "INSERT INTO bookings (roomId, userId, start, end) VALUES (?, ?, ?, ?)"
    )
    .run(roomId, userId, start, end);
};

// --- READ ---

/**
 * Finds a single booking by its unique ID.
 * @param {number} id - The ID of the booking.
 * @returns {object|undefined} The booking object or undefined if not found.
 */
export const getBookingById = (id) => {
  return db.prepare("SELECT * FROM bookings WHERE id = ?").get(id);
};

/**
 * Finds all bookings made by the user with the given ID.
 * @param {number} userId The ID of the user.
 * @returns {object} An object containing the booking data.
 */
export const getAllBookingsByUser = (userId) => {
  return db.prepare("SELECT * FROM bookings WHERE userId = ?").all(userId);
};

/**
 * Finds all bookings made for the room with the given ID.
 * @param {number} roomId The ID of the room.
 * @returns {object} An object containing the booking data.
 */
export const getAllBookingsByRoom = (roomId) => {
  return db.prepare("SELECT * FROM bookings WHERE roomId = ?").all(roomId);
};

/**
 * Finds all bookings that overlap with the given time period.
 * @param {string} start The start date and time of the period in ISO 8601 format.
 * @param {string} end {string} The end date and time of the period in ISO 8601 format.
 * @returns {object} An object containing the booking data.
 */
export const getAllBookingsByDate = (start, end) => {
  return db
    .prepare("SELECT * FROM bookings WHERE start >= ? AND end <= ?")
    .all(start, end);
};

// --- UPDATE ---

/**
 * Changes the status of a booking in the database by its ID.
 * @param {number} id - The ID of the booking to change.
 * @param {string} status - The new status of the booking. Must be one of the following: "active", "cancelled".
 * @returns {object} The result of the change operation.
 */
export const changeBookingStatusById = (id, status) => {
  return db
    .prepare("UPDATE bookings SET status = ? WHERE id = ?")
    .run(status, id);
};

// --- DELETE ---

/**
 * Deletes a booking from the database by its ID.
 * @param {number} id - The ID of the booking to delete.
 * @returns {object} The result of the deletion operation.
 */
export const deleteBookingById = (id) => {
  return db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
};
