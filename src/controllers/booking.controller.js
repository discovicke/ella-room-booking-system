/**
 * 🤵 BOOKING CONTROLLER
 * * PURPOSE:
 * Handles requests to create or view bookings.
 * * SCOPE:
 * - createBooking(req, res): Creates a new booking.
 * - listBookings(req, res): Lists all bookings.
 * * RELATION:
 * - Imports: 'src/repositories/booking.repo.js'
 * - Imported by: 'src/routes/booking.routes.js'
 */

import * as bookingRepo from "../repositories/booking.repo.js";

export const listBookings = (req, res) => {
  try {
    const bookings = bookingRepo.getAllBookings();
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).send({ error: "Could not fetch bookings" });
  }
};

/**
 * Creates a new booking in the database.
 *
 * @param {Object} req.body - should contain roomId, userId, start, end, status (opt), notes (opt)
 * @returns {void} Sends a 201 Created status with no body.
 * @throws {Error} Returns 500 JSON if creation fails.
 */
export const createBooking = (req, res) => {
  try {
    const { roomId, userId, start, end, status, notes } = req.body;

    // Validate required fields
    if (!roomId || !userId || !start || !end) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prepare data
    const bookingData = {
      room_id: roomId,
      user_id: userId,
      start_time: start,
      end_time: end,
      // Use || so empty strings "" become defaults
      status: status || "active",
      notes: notes || null,
    };

    // Create the booking
    bookingRepo.createBooking(bookingData);

    return res.status(201).send();
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ error: "Failed to create booking" });
  }
};
