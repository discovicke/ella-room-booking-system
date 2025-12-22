/**
 * 📜 BOOKING ROUTES
 * * PURPOSE:
 * Maps URL paths to Controller functions for Bookings.
 * * SCOPE:
 * - POST /  ->  bookingController.createBooking
 * - GET /user/:id  ->  bookingController.getUserBookings
 * * RELATION:
 * - Imports: 'src/controllers/bookings.controller.js'
 * - Imported by: 'src/app.js'
 */

import express from "express";

const bookingsRouter = express.Router();

bookingsRouter.post("/", (req, res) => {
  res.send("Create a new booking");
});

export default bookingsRouter;
