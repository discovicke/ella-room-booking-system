/**
 * 🤵 BOOKING CONTROLLER
 * * PURPOSE: Handles requests to create or view bookings.
 */

import * as bookingRepo from "./booking.repo.js";

/**
 * GET /api/bookings
 * - Students: only their own bookings
 * - Teachers/Admins: all bookings, or can filter with ?userId=
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
 * POST /api/bookings
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

    // 2. Check for Overlaps (Prevent Double Booking)
    const overlaps = bookingRepo.getOverlappingBookings(
      room_id,
      start_time,
      end_time
    );

    if (overlaps.length > 0) {
      return res.status(409).json({
        error: "This room is already booked for the selected time slot.",
      });
    }

    // 3. Prepare Data
    const bookingData = {
      ...req.body,
      status: status || "active",
      notes: notes || null,
    };

    // 4. Pass directly to Repo
    bookingRepo.createBooking(bookingData);

    return res.status(201).send();
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.sendStatus(500);
  }
};

/**
 * PUT /api/bookings/:id
 * Updates a booking using a "Fetch -> Merge -> Update" strategy.
 */
export const updateBooking = (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1. Fetch Existing Booking
    // Crucial to prevent overwriting missing fields with null!
    const existingBooking = bookingRepo.getBookingById(id);

    if (!existingBooking) {
      return res.status(404).json({ error: `Booking with ID ${id} not found` });
    }

    // 2. Prepare Data (Merge Strategy)
    // The repo will strip out extra fields (like created_at), so no need to worry here.
    const bookingData = {
      ...existingBooking, // Start with old data
      ...req.body, // Overwrite with new data (e.g. status)
    };

    // 3. Perform Update
    const info = bookingRepo.updateBookingById(id, bookingData);

    if (info.changes === 0) {
      return res.status(404).json({ error: `Could not update booking ${id}` });
    }

    res.status(200).json({
      message: `Updated booking with ID ${id}`,
      booking: bookingData,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
};

/**
 * DELETE /api/bookings/:id
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
    res.sendStatus(500);
  }
};

/**
 * GET /api/bookings/user/:userId
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
