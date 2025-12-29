/**
 * 🤵 BOOKING CONTROLLER
 * * PURPOSE: Handles requests to create or view bookings.
 */

import * as bookingRepo from "./booking.repo.js";

/**
 * GET /api/bookings
 * - Students: only their own bookings
 * - Teachers/Admins: all bookings, or can filter with ?userId=
 *
 * Retrieves all bookings from the database.
 *
 * @returns {Response} a response with a 200 status and a JSON body containing all bookings.
 * @throws {Error} if an error occurs while fetching bookings, returns a response with a 500 status.
 */
export const listBookings = (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser) return res.sendStatus(401);

    // If student -> only their bookings
    if (authUser.role === "student") {
      const bookings = bookingRepo.getAllBookingsByUserWithRoom(authUser.id);
      return res.status(200).json(bookings);
    }

    // Teachers/Admins can optionally filter by query param
    if (req.query.userId) {
      const userId = Number(req.query.userId);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: "Invalid userId" });
      }
      const bookings = bookingRepo.getAllBookingsByUserWithRoom(userId);
      return res.status(200).json(bookings);
    }

    // Default: return all bookings (for teachers/admins)
    const bookings = bookingRepo.getAllBookingsWithRoom();
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return res.sendStatus(500);
  }
};

/**
 * Creates a new booking with the given data.
 * @param {Object} req.body object containing booking data in snake_case.
 * @param {Response} res response to send back to the client.
 * @returns {Response} a response with either a 201 status and no body or a 400/500 status.
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

    // 2. Prepare Data (Spread body + Add defaults)
    const bookingData = {
      ...req.body,
      status: status || "active",
      notes: notes || null,
    };

    // 3. Pass directly to Repo
    bookingRepo.createBooking(bookingData);

    return res.status(201).send();
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.sendStatus(500);
  }
};

/**
 * Updates a booking with the given ID.
 * @param {Request} req request containing the booking data to update in req.body and the ID in req.params.id.
 * @param {Response} res response to send back to the client.
 * @returns {Response} a response with either a 200 status and a success message or a 404/500 status.
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
    res.sendStatus(500);
  }
};

/**
 * Deletes a booking with the given ID.
 * @param {Request} req request containing the ID of the booking to delete in req.params.id.
 * @param {Response} res response to send back to the client.
 * @returns {Response} a response with either a 200 status and a success message or a 404/500 status.
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
    // Security: Do not leak error details to client
    res.sendStatus(500);
  }
};

/**
 * GET /api/bookings/user/:userId
 * - Students: may only fetch their own bookings (403 otherwise)
 * - Teachers/Admins: may fetch any user's bookings
 */
export const listBookingsByUser = (req, res) => {
  try {
    const authUser = req.user;
    if (!authUser) return res.sendStatus(401);

    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }

    // Prevent students from viewing others' bookings
    if (authUser.role === "student" && authUser.id !== userId) {
      return res.status(403).json({ error: "Access denied." });
    }

    const bookings = bookingRepo.getAllBookingsByUserWithRoom(userId);
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings by user:", error);
    return res.sendStatus(500);
  }
};
