/**
 * 🤵 BOOKING CONTROLLER
 * * PURPOSE: Handles requests to create or view bookings.
 */

import * as bookingRepo from "../repositories/booking.repo.js";
import * as roomRepo from "../repositories/room.repo.js";

/**
 * Retrieves all bookings from the database.
 *
 * @returns {Response} a response with a 200 status and a JSON body containing all bookings.
 * @throws {Error} if an error occurs while fetching bookings, returns a response with a 500 status and an error message.
 */
export const listAllBookings = (req, res) => {
  try {
    const bookings = bookingRepo.getAllBookings();
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.status(500).send({ error: "Could not fetch bookings" });
  }
};

/**
 * Creates a new booking with the given data.
 * @param {Object} req.body object containing booking data in snake_case.
 * @param {Response} res response to send back to the client.
 * @returns {Response} a response with either a 201 status and no body or a 400/500 status with an error message.
 * @throws {Error} if an error occurs while creating the booking.
 */
export const createBooking = (req, res) => {
  try {
    // 1. Validation (Expecting snake_case from client)
    const { room_id, user_id, start_time, end_time, status, notes } = req.body;

    if (!room_id || !user_id || !start_time || !end_time) {
      return res.status(400).json({
        error:
          "Missing required fields (room_id, user_id, start_time, end_time)",
      });
    }

    // 2. Validate Dates
    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({
        error: "Start time must be before end time",
      });
    }

    // 3. Check if Room Exists
    const room = roomRepo.getRoomById(room_id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // 4. Check for Double Booking (Conflict)
    const conflicts = bookingRepo.findConflictingBookings(
      room_id,
      start_time,
      end_time
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: "Room is already booked during this time interval",
        conflicts,
      });
    }

    // 5. Prepare Data (Spread body + Add defaults)
    const bookingData = {
      ...req.body,
      status: status || "active",
      notes: notes || null,
    };

    // 6. Pass directly to Repo
    bookingRepo.createBooking(bookingData);

    return res.status(201).json({ message: "Booking created successfully" });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ error: "Failed to create booking" });
  }
};

/**
 * Updates a booking with the given ID.
 * @param {Request} req request containing the booking data to update in req.body and the ID of the booking to update in req.params.id.
 * @param {Response} res response to send back to the client.
 * @returns {Response} a response with either a 200 status and a success message or a 404/500 status with an error message.
 * @throws {Error} if an error occurs while updating the booking.
 */
export const updateBooking = (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. Prepare Data
    // We strictly use req.body values, defaulting only if they are missing/undefined
    const bookingData = {
      ...req.body,
      status: req.body.status || "active",
      notes: req.body.notes || null,
    };

    // 2. Perform Update
    const info = bookingRepo.updateBookingById(id, bookingData);

    if (info.changes === 0) {
      return res.status(404).json({ error: `Booking with ID ${id} not found` });
    }

    res.status(200).send(`Updated booking with ID ${id}`);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
};

/**
 * Deletes a booking with the given ID.
 * @param {Request} req request containing the ID of the booking to delete in req.params.id.
 * @param {Response} res response to send back to the client.
 * @returns {Response} a response with either a 200 status and a success message or a 404/500 status with an error message.
 * @throws {Error} if an error occurs while deleting the booking.
 */
export const deleteBooking = (req, res) => {
  try {
    const id = Number(req.params.id);
    const info = bookingRepo.deleteBookingById(id);
    if (info.changes === 0) {
      return res.status(404).json({ error: `Booking with ID ${id} not found` });
    }
    res.status(200).send(`Deleted booking with ID ${id}`);
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};
