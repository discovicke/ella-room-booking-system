/**
 * ⚙️ APP CONFIGURATION
 * PURPOSE: The main "Rulebook" for the Express application.
 */

import express from "express";
import bookingsRouter from "./routes/booking.routes.js";
import roomsRouter from "./routes/room.routes.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express();

// Allows the app to understand JSON data sent in requests
app.use(express.json());

// ==========================
// FRONTEND SERVING
// ==========================

// A. Specific Page Routes (Clean URLs)
// Maps "/login" -> "src/public/login/login.html", etc.
app.use("/login", express.static("src/public/login", { index: "login.html" }));
app.use(
  "/student",
  express.static("src/public/student", { index: "student.html" })
);
app.use(
  "/teacher",
  express.static("src/public/teacher", { index: "teacher.html" })
);
app.use("/admin", express.static("src/public/admin", { index: "admin.html" }));

// Redirect root to /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// B. General Public Fallback
// Serves shared assets (like /css, /js, /assets) from the root public folder.
// NOTE: This is intentionally registered *after* the specific page routes above
// so that those routes take precedence in Express's middleware ordering.
app.use(express.static("src/public"));

// ==========================

// API ROUTES
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);

export default app;
