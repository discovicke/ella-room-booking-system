# 🗺️ Project Map Cheat Sheet

## Backend (src/) — The Kitchen

Purpose: Server logic, data, rules.

- db/ 🔌 Power Socket: DB connection and helpers.
- repositories/ 📚 Librarian: All SQL lives here.
- controllers/ 🤵 Waiter: Accepts requests, returns JSON.
- middleware/ 🛡️ Security Staff:
  - cookieParser.middleware.js: Parses cookie headers into `req.cookies`.
  - authentication.middleware.js: Hybrid strategy. Checks `auth_token` cookie first, then Bearer header.
  - authorization.middleware.js: Checks `req.user.role` against allowed roles.
- constants/ 🔖 Shared Truths: roles.js with ROLES.
- utils/ 🧰 Tool Belt: hashing, token generation, etc.
- routes/ 📜 Menu: Maps URLs to controllers.
- app.js 📘 Rulebook: Registers middleware, static asset protection, and routes.
- server.js ▶️ Start Button: Boots the server.

## Frontend (public/) — The Dining Room

Purpose: Browser-facing pages and scripts.

- HTML 🖼️ Structure per page (login, student, teacher, admin)
- css/ 🎨 Styles
- api/api.js 🌐 API layer: Uses `credentials: "include"` to send cookies. Handles 401 redirects.
- login/login.js 🔑 Handles login. Stores **User object** in localStorage, but **Token** is handled via Cookie.
- Protected Routes: The server (`app.js`) protects `/student`, `/teacher`, and `/admin` HTML files directly.

## Data Flow

Browser (Cookie) → CookieParser → authentication.middleware → authorization.middleware → Controller → Repository → DB → Controller → Browser

---

# 🧭 The Project Map Guide

Our codebase is split into two worlds: The Kitchen (Backend) and The Dining Room (Frontend).

## 📂 src/

### middleware/ 🛡️

- **cookieParser.middleware.js**:
  - Manually parses the `Cookie` header string into a usable object `req.cookies`.
- **authentication.middleware.js** (The Bouncer):

  - **Strategy**: Hybrid.
    1. **Priority**: Checks `req.cookies.auth_token` (Secure, HttpOnly).
    2. **Fallback**: Checks `Authorization: Bearer <token>` (For Postman/Testing).
  - **Behavior**:
    - If API request fails: Returns `401 Unauthorized`.
    - If HTML page request (e.g., /student) fails: **Redirects** to `/login`.

- **authorization.middleware.js** (The Gatekeeper):
  - `authorize(...roles)` allows only if `req.user.role` is in roles.
  - Sends 403 if role not permitted.

### controllers/ 🤵

- **auth.controller.js**:
  - `login`: Validates credentials, creates DB session, and sets `res.cookie('auth_token', ...)` (HttpOnly).
  - `logout`: Deletes DB session and calls `res.clearCookie('auth_token')`.

### app.js 📘

Configures server-side protection for static HTML files.
_Example:_ `app.use("/admin", authenticate, authorize("admin"), express.static(...))`

---

## 📂 public/

### api/api.js 🌐

`apiFetch()` sets `credentials: "include"`. This tells the browser to include the HttpOnly cookie in the request. It relies on the browser's cookie jar, not localStorage.

### login/login.js 🔑

Submits credentials. On success, the **browser** saves the cookie automatically. The JS only saves non-sensitive user data to localStorage for UI convenience and redirects.

---

## 🚀 Flows

### Login

1. POST /api/auth/login with email/password
2. Server verifies password, creates session.
3. Server sends response: `Set-Cookie: auth_token=xyz; HttpOnly` + JSON User Data.
4. Browser saves cookie (JS cannot read this).
5. Frontend stores User JSON in localStorage and redirects.

### Authenticated Request (API & Pages)

1. Browser automatically attaches `Cookie: auth_token=xyz` to the request.
2. `cookieParser` reads the header.
3. `authentication.middleware` validates session and attaches `req.user`.
4. If accessing a protected HTML page without a cookie, the server redirects to `/login`. If accessing with a cookie but the wrong role, it redirects to `/403` (Authorization).

### Logout

1. DELETE /api/auth/logout.
2. Server deletes session from DB.
3. Server sends `Set-Cookie: auth_token=; Max-Age=0` to clear it.

---

## 🧪 Quick Tests (Postman / Curl)

Since we use a **Hybrid** approach, you can still test endpoints easily using headers without needing to manage cookies in your terminal.

Login (Browser/Client simulation)

```powershell
# Browser handles the cookie automatically
Manual Testing (Developer Mode) The middleware accepts the Bearer header as a fallback!

curl http://localhost:80/api/rooms `
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"


Admin-only Test

curl -X DELETE http://localhost:80/api/rooms/123 `
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```
