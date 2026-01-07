/**
 * 📜 BOOKING ROUTES
 * * PURPOSE: Maps URL paths to Controller functions.
 */

import express from "express";
import * as bookingController from "./booking.controller.js";
import { authenticate } from "../../middleware/authentication.middleware.js";

const bookingsRouter = express.Router();

// GET /api/bookings - Get all bookings (All authenticated users)
bookingsRouter.get("/", authenticate, bookingController.listBookings);

// GET /api/bookings/user/:userId - Get bookings for a specific user
bookingsRouter.get(
  "/user/:userId",
  authenticate,
  bookingController.listBookingsByUser
);

// POST /api/bookings - Create a new booking (All authenticated users)
bookingsRouter.post("/", authenticate, bookingController.createBooking);

// PUT /api/bookings/:id - Update booking by ID (All authenticated users)
bookingsRouter.put("/:id", authenticate, bookingController.updateBooking);

// DELETE /api/bookings/:id - Delete booking by ID (All authenticated users)
// bookingsRouter.delete("/:id", authenticate, bookingController.deleteBooking); // Never used so commented out

export default bookingsRouter;
