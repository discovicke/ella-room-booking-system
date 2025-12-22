/**
 * 📚 BOOKING REPOSITORY
 * * PURPOSE:
 * Handles access to the "bookings" table.
 * * SCOPE:
 * - Function: createBooking(data) -> INSERT INTO bookings...
 * - Function: findBookingsByRoom(roomId) -> SELECT ...
 * - Function: findBookingsByUser(userId) -> SELECT ...
 * * RELATION:
 * - Imports: 'src/db/query.js'
 * - Imported by: 'src/controllers/bookings.controller.js'
 */

import { db } from "../db/db.js";

const query = db.prepare("SELECT * FROM bookings");
const users = query.all();

console.log(users);

/**
 * Finds all bookings made by the user with the given ID.
 * @param {number} userId The ID of the user.
 * @returns {object} An object containing the booking data.
 */
export const getBookingsByUser = (userId) => {
  return db.prepare("SELECT * FROM bookings WHERE userId = ?").get(userId);
};

/**
 * Finds all bookings made for the room with the given ID.
 * @param {number} roomId The ID of the room.
 * @returns {object} An object containing the booking data.
 */
export const getBookingsByRoom = (roomId) => {
  return db.prepare("SELECT * FROM bookings WHERE roomId = ?").get(roomId);
};

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

/**
 * Deletes a booking from the database by its ID.
 * @param {number} id - The ID of the booking to delete.
 * @returns {object} The result of the deletion operation.
 */
export const deleteBookingById = (id) => {
  return db.prepare("DELETE FROM bookings WHERE id = ?").run(id);
};
