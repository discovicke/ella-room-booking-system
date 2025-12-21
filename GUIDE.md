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
  Code that runs _before_ the controller to check if you are allowed in.

- **`utils/`** 🧰 Tool Belt
  Helper functions (like password hashing) that don't belong in controllers.

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
  Fetches data, updates the DOM, stores state.

## Data Flow

Browser → Route → **Middleware** → Controller → Repository → Controller → Browser

---

# 🗺️ The Project Map Guide: How Our Code Is Organized

Our codebase is divided into two distinct worlds:

- **The Kitchen** which is the Backend
- **The Dining Room** which is the Frontend

Each part has a clear role, and each file knows exactly what it is responsible for.

## 📂 `src/`

### The Kitchen (Backend)

This is where the server lives. It handles logic, data, and rules. The browser never sees this code.

### `src/db/` 🔌

**Analogy:** The Power Socket

This folder establishes the connection to our SQLite database. Everything else depends on it.

- `db.js` opens the database connection
- `query.js` provides helper utilities

You usually touch this only during setup.

### `src/repositories/` 📚

**Analogy:** The Librarian

This layer talks directly to the database. It contains raw SQL and nothing else.

- Runs queries like `SELECT` and `INSERT`
- Knows tables and columns
- Has no idea what HTTP requests or users are

Example:
`room.repo.js` exposes `getAllRooms()` which runs `SELECT * FROM rooms`.

Rule of thumb: SQL belongs here and nowhere else.

### `src/middleware/` 🛡️

**Analogy:** The Bouncer

Middleware stands at the door of your routes. It checks every request _before_ it reaches the Controller (The Waiter).

- Checks for valid Session Tokens (Wristbands)
- Rejects unauthorized users (401 Unauthorized)
- Adds user info to the request

Example:
`auth.middleware.js` checks if the user is logged in before letting them book a room.

### `src/utils/` 🧰

**Analogy:** The Tool Belt

This folder holds small, useful tools that are used across the application but aren't specific to one feature.

- Generating random tokens
- Hashing passwords
- Formatting dates

These are pure functions: Data in -> Data out.

### `src/controllers/` 🤵

**Analogy:** The Waiter

Controllers handle incoming requests and outgoing responses.

Their job follows a clear sequence:

1. Receive the request
2. Ask the Librarian for data or actions
3. Send a response back as JSON

Example:
`room.controller.js` exposes `listRooms(req, res)`.

### `src/routes/` 📜

**Analogy:** The Menu

Routes define which URLs exist and which controller handles them.

Example:
`GET /api/rooms` points to `roomController.listRooms`.

This layer contains no logic, only mapping.

### `src/app.js` and `src/server.js` ⚙️

- **`app.js`** is the Rulebook

  - Registers middleware
  - Enables JSON
  - Attaches routes

- **`server.js`** is the Start Button

  - Imports the app
  - Starts listening on a port

## 📂 `public/`

### The Dining Room (Frontend)

This is what users interact with. The browser runs this code.

### Root HTML Files (`index.html`, `login.html`) 🖼️

**Analogy:** The Plates

These files define the structure of the page. Many elements start empty and wait for data.

Example:
`<div id="room-list"></div>`

### `public/css/` 🎨

**Analogy:** The Decoration

CSS controls layout, colors, spacing, and typography. It shapes how everything looks.

### `public/js/` 🤖

**Analogy:** The Customer

JavaScript in the browser drives interaction.

It performs three main tasks:

1. Requests data using `fetch()`
2. Inserts that data into the HTML
3. Stores session state in `localStorage`

## 🚀 How Everything Works Together

When a user clicks **Show Rooms**:

1. The browser calls `fetch('/api/rooms')`
2. The router matches the URL
3. **The Middleware checks if you are allowed in**
4. The controller asks the repository for data
5. The repository runs a SQL query
6. The controller returns JSON
7. The browser renders the result as HTML

That is the full loop from click to content.

## ⚠️ Important Notes for the Team

### 1. The "Date" Trap 📅
SQLite does not have a native "Date" type; it saves dates as plain text.
To ensure sorting works (so Monday comes before Tuesday), **ALWAYS** use the ISO 8601 format:

- ✅ **Correct:** `YYYY-MM-DD HH:MM:SS` (e.g., "2025-01-06 14:30:00")
- ❌ **Incorrect:** `2025-1-6 2:30pm` (This will break sorting!)

### 2. "Are we RESTful?" (The Wristband Logic) 🎟️
Strict REST APIs are "Stateless" (the server forgets you after every request).
However, to make this project easier to learn and debug, we use **Stateful Sessions**.

- **How it works:** We give the user a "Wristband" (Token). The server looks up this token in the Database (`sessions` table) to see who they are.
- **Why?** This makes "Logging Out" easy (we just delete the wristband from the DB) and avoids complex cryptography (JWTs) for now.