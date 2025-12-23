/**
 * 📜 BOOKING ROUTES
 * * PURPOSE: Maps URL paths to Controller functions.
 */

import express from "express";
import * as bookingController from "../controllers/booking.controller.js";

const bookingsRouter = express.Router();

// Route directs traffic to the Controller
bookingsRouter.get("/", bookingController.listBookings);
bookingsRouter.post("/", bookingController.createBooking);

bookingsRouter.put("/:id", bookingController.updateBooking);

bookingsRouter.delete("/:id", bookingController.deleteBooking);

export default bookingsRouter;
