Here is your updated **Project Map Cheat Sheet** and **Guide**, refactored to reflect your new **Vertical Slice (Modules)** architecture.

I have updated the structure to emphasize that features (like Bookings or Auth) now live together in `src/modules/` rather than being split across `controllers/` and `repositories/` folders.

---

# 🗺️ Project Map Cheat Sheet

## Backend (src/) — The Kitchen

**Purpose:** Server logic, data, rules.

- **modules/** 🏗️ **Vertical Slices:** Self-contained feature folders.
- **auth/**: `auth.controller`, `auth.routes`, `session.repo`.
- **bookings/**: `booking.controller`, `booking.routes`, `booking.repo`.
- **rooms/**: `room.controller`, `room.routes`, `room.repo`.
- **users/**: `user.controller`, `user.routes`, `user.repo`.

- **db/** 🔌 **Power Socket:** DB connection (`db.js`).
- **middleware/** 🛡️ **Security Staff:**
- `cookieParser.middleware.js`: Parses cookie headers into `req.cookies`.
- `authentication.middleware.js`: **Strict Strategy.** Checks `auth_token` cookie ONLY.
- `authorization.middleware.js`: Checks `req.user.role` against allowed roles.

- **constants/** 🔖 **Shared Truths:** `roles.js` (ADMIN, TEACHER, STUDENT).
- **utils/** 🧰 **Tool Belt:** Shared helpers (hashing, security).
- **app.js** 📘 **Rulebook:** Registers middleware, static assets, and **Module Routes**.
- **server.js** ▶️ **Start Button:** Boots the server.

## Frontend (public/) — The Dining Room

**Purpose:** Browser-facing pages and scripts.

- **HTML** 🖼️ Structure per page (login, student, teacher, admin).
- **css/** 🎨 Styles.
- **api/api.js** 🌐 API layer: Uses `credentials: "include"` to send cookies. Handles 401 redirects.
- **login/login.js** 🔑 Handles login. Stores **User object** in localStorage. Token is invisible to JS.
- **Protected Routes:** The server (`app.js`) protects `/student`, `/teacher`, and `/admin` HTML files directly.

## Data Flow

Browser (Cookie) → CookieParser → authentication.middleware → authorization.middleware → **Module Controller** → **Module Repo** → DB → **Module Controller** → Browser

---

# 🧭 The Project Map Guide

Our codebase is split into two worlds: The Kitchen (Backend) and The Dining Room (Frontend).

## 📂 src/

### middleware/ 🛡️

- **cookieParser.middleware.js**:
- Manually parses the `Cookie` header string into a usable object `req.cookies`.

- **authentication.middleware.js** (The Bouncer):
- **Strategy**: Cookie Only.
- **Behavior**:
- Checks `req.cookies.auth_token` (Secure, HttpOnly).
- If API request fails: Returns `401 Unauthorized`.
- If HTML page request (e.g., /student) fails: **Redirects** to `/login`.

### modules/ 🏗️ (The Logic)

Instead of splitting files by type, we group them by feature.

- **modules/bookings/**:
- **Controller**: Handles validation (Start < End). Checks for conflicts. Returns `409 Conflict` if overlap found, or `201` if created.
- **Repo**: Contains SQL for bookings. Includes the `overlap check` logic (SQL).

- **modules/auth/**:
- **Controller**: `login` verifies password & sets `res.cookie` (HttpOnly). `logout` deletes session & clears cookie.
- **Repo**: Manages the `sessions` table (create/delete tokens).

- **modules/rooms/**:
- **Controller/Repo**: Handles CRUD for Rooms and Assets.

- **modules/users/**:
- **Controller/Repo**: Handles CRUD for Users (Admin only).

### app.js 📘

Configures server-side protection for static HTML files and connects the Module pipelines.
_Example:_ `app.use("/admin", authenticate, authorize("admin"), express.static(...))`

---

## 📂 public/

### api/api.js 🌐

`apiFetch()` sets `credentials: "include"`. This tells the browser to include the HttpOnly cookie in the request automatically. It catches `409 Conflict` errors so the UI can display "Room already booked".

### login/login.js 🔑

Submits credentials. On success, the **browser** saves the cookie automatically. The JS only saves non-sensitive user data to localStorage for UI convenience (e.g., "Welcome, Sven").

---

## 🚀 Flows

### Login

1. POST `/api/auth/login` with email/password.
2. **Auth Module** verifies password, creates session in DB.
3. Server sends response: `Set-Cookie: auth_token=xyz; HttpOnly` + JSON User Data.
4. Browser saves cookie (JS cannot read this).
5. Frontend stores User JSON in localStorage and redirects.

### Authenticated Request (API & Pages)

1. Browser automatically attaches `Cookie: auth_token=xyz` to the request.
2. `cookieParser` reads the header.
3. `authentication.middleware` validates session (via **Auth Module**) and attaches `req.user`.
4. If accessing a protected HTML page without a cookie, the server redirects to `/login`.

### Booking Flow (Double Booking Check)

1. User sends booking request (Start: 10:00, End: 12:00).
2. **Booking Module** runs SQL: `SELECT * FROM bookings WHERE start < 12:00 AND end > 10:00`.
3. **If Result Found:** Server returns `409 Conflict`. Frontend alerts user.
4. **If Empty:** Server inserts booking. Returns `201 Created`.

### Logout

1. POST `/api/auth/logout` (Cookie sent automatically).
2. **Auth Module** reads token from cookie, deletes session from DB.
3. Server sends `Set-Cookie: auth_token=; Max-Age=0` to clear it.

---

## 🧪 Testing

Since we use **Cookie-Only Auth**, manual testing with cURL requires a cookie jar, and Postman handles cookies automatically through the [Postman Interceptor](https://learning.postman.com/docs/sending-requests/capturing-request-data/interceptor/) browser extension.

**Testing with Postman:**

1. Send `POST /api/auth/login`. Postman will automatically save the cookie.
2. Send `GET /api/rooms`. It will work without adding any headers manually.
3. Send `POST /api/bookings` twice with the same times to test the 409 Conflict error.
