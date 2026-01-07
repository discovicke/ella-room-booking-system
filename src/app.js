/**
 * ⚙️ APP CONFIGURATION
 */
import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/user.routes.js";
import roomsRouter from "./modules/rooms/room.routes.js";
import bookingsRouter from "./modules/bookings/booking.routes.js";
import { cookieParser } from "./middleware/cookieParser.middleware.js";
import { authenticate } from "./middleware/authentication.middleware.js";
import { authorize } from "./middleware/authorization.middleware.js";
import { ROLES } from "./constants/roles.js";

const app = express();

app.use(express.json());
app.use(cookieParser);

// ==========================
// 🔓 1. PUBLIC ASSETS
// ==========================

app.use("/css", express.static("src/public/css"));
app.use("/js", express.static("src/public/js"));
app.use("/assets", express.static("src/public/assets"));
app.use("/constants", express.static("src/constants"));
app.use("/api", express.static("src/public/api"));
app.use("/utils", express.static("src/public/utils"));
app.use("/components", express.static("src/public/components"));

// ==========================
// 🔓 2. PUBLIC PAGES ()
// ==========================

// if /login redirect to /
app.get("/login", (req, res) => {
  res.redirect("/");
});

// if /index.html redirect to /
app.get("/index.html", (req, res) => {
  res.redirect("/");
});

// Login page is now the root page
app.use("/", express.static("src/public/pages/login", { index: "index.html" }));

app.get("/403", (req, res) =>
  res.sendFile("403.html", { root: "src/public/pages" })
);
app.get("/404", (req, res) =>
  res.sendFile("404.html", { root: "src/public/pages" })
);

// ==========================
// 🛡️ 3. PROTECTED PAGES (HTML VIEWS)
// ==========================
app.use(
  "/student",
  authenticate,
  authorize(ROLES.STUDENT),
  express.static("src/public/pages/student", { index: "student.html" })
);
app.use(
  "/teacher",
  authenticate,
  authorize(ROLES.TEACHER),
  express.static("src/public/pages/teacher", { index: "teacher.html" })
);
app.use(
  "/admin",
  authenticate,
  authorize(ROLES.ADMIN),
  express.static("src/public/pages/admin", { index: "admin.html" })
);

// ==========================
// 🛡️ 4. API ROUTES
// ==========================
// /api/auth stays public so users can hit /login (via fetch)
app.use("/api/auth", authRouter);

// 🔒 These require a valid cookie/token
app.use("/api/users", authenticate, userRouter);
app.use("/api/rooms", authenticate, roomsRouter);
app.use("/api/bookings", authenticate, bookingsRouter);

// ==========================
// 🔀 5. ERRORS
// ==========================

// Catch-all 404 (Must be last)
app.use((req, res) => {
  if (req.accepts("html")) return res.status(404).redirect("/404");
  res.status(404).json({ error: "Endpoint not found" });
});

export default app;
