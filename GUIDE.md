Based on your transition to stateless **Basic Authentication**, here is the updated **Project Map Guide**. This version replaces the "Wristband" (session token) logic with the new credential-verification flow.

---

# TLDR:

# 🗺️ Project Map Cheat Sheet

## Backend (`src/`) — The Kitchen

**Purpose:** Server logic, data, rules.

- **`db/`** 🔌 Power Socket
  Opens and manages the database connection.
- **`repositories/`** 📚 Librarian
  Runs all SQL queries. Talks to the database only.
- **`controllers/`** 🤵 Waiter
  Handles requests and responses. Calls repositories.
- **`middleware/`** 🛡️ The Bouncer
  Code that runs _before_ the controller to verify your credentials using Basic Auth.
- **`utils/`** 🧰 Tool Belt
  Helper functions (like password hashing and decoding Basic Auth).
- **`routes/`** 📜 Menu
  Maps URLs to controllers.
- **`app.js`** 📘 Rulebook
  Registers middleware and routes.
- **`server.js`** ▶️ Start Button
  Starts the server and listens on a port.

## Frontend (`public/`) — The Dining Room

**Purpose:** Everything the browser runs and displays.

- **HTML files** 🖼️ Plates
  Page structure and placeholders.
- **`css/`** 🎨 Decoration
  Styling and layout.
- **`js/`** 🤖 Customer
  Fetches data, updates the DOM, and stores Base64 credentials.

## Data Flow

Browser → Route → **Middleware (Verify Credentials)** → Controller → Repository → Controller → Browser

---

# 🗺️ The Project Map Guide: How Our Code Is Organized

Our codebase is divided into two distinct worlds: **The Kitchen** (Backend) and **The Dining Room** (Frontend).

## 📂 `src/`

### The Kitchen (Backend)

This is where the server lives. It handles logic, data, and rules. The browser never sees this code.

### `src/db/` 🔌

**Analogy:** The Power Socket
This folder establishes the connection to our SQLite database.

- `db.js` opens the database connection.
- `query.js` provides helper utilities.

### `src/repositories/` 📚

**Analogy:** The Librarian
This layer talks directly to the database. It contains raw SQL and nothing else.

- Runs queries like `SELECT` and `INSERT`.
- Has no idea what HTTP requests or users are.
- **Rule of thumb:** SQL belongs here and nowhere else.

### `src/middleware/` 🛡️

**Analogy:** The Bouncer
Middleware stands at the door of your routes. It checks every request _before_ it reaches the Controller.

- Decodes the `Authorization: Basic ...` header.
- Verifies the email and password against the database for **every single request**.
- Rejects unauthorized users with a `401 Unauthorized`.

### `src/utils/` 🧰

**Analogy:** The Tool Belt
Holds small, useful tools used across the application.

- Decoding Basic Auth headers.
- Hashing and verifying passwords.

### `src/controllers/` 🤵

**Analogy:** The Waiter
Controllers handle incoming requests and outgoing responses.

1. Receive the request.
2. Ask the Librarian for data.
3. Send a response back as JSON.

### `src/routes/` 📜

**Analogy:** The Menu
Defines which URLs exist and which controller handles them. Example: `POST /login` points to `authController.login`.

---

## 📂 `public/`

### The Dining Room (Frontend)

This is what users interact with. The browser runs this code.

### `public/js/` 🤖

**Analogy:** The Customer
JavaScript in the browser drives interaction.

1. Requests data using `fetch()`.
2. Inserts that data into the HTML.
3. Stores Base64 credentials in `localStorage` so you stay "logged in".

---

## 🚀 How Everything Works Together

When a user clicks **Show Rooms**:

1. The browser attaches stored credentials to `fetch('/api/rooms')` in the `Authorization` header.
2. The router matches the URL.
3. **The Middleware verifies your credentials against the Users table**.
4. The controller asks the repository for data.
5. The repository runs a SQL query.
6. The controller returns JSON.
7. The browser renders the result.

---

## ⚠️ Important Notes for the Team

### 1. The "Date" Trap 📅

SQLite saves dates as plain text. To ensure sorting works, **ALWAYS** use ISO 8601: `YYYY-MM-DD HH:MM:SS`.

### 2. "Are we RESTful?" (Stateless Auth) 🎟️

This project uses **Stateless Basic Authentication**.

- **How it works:** The server does not "remember" you. The browser sends your ID card (email and password) with every request.
- **Why?** This is a truly stateless REST approach. We no longer need a `sessions` table in the database; if the credentials in the header are valid, the request is allowed.
