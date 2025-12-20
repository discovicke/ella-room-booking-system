# TLDR:

# 🗺️ Project Map Cheat Sheet

## Backend (`src/`) — The Kitchen

**Purpose:** Server logic, data, rules.

* **`db/`** 🔌 Power Socket
  Opens and manages the database connection.

* **`repositories/`** 📚 Librarian
  Runs all SQL queries. Talks to the database only.

* **`services/`** 🧠 Manager
  Handles complex business logic and decisions. Optional.

* **`controllers/`** 🤵 Waiter
  Handles requests and responses. Calls repositories or services.

* **`routes/`** 📜 Menu
  Maps URLs to controllers.

* **`app.js`** 📘 Rulebook
  Registers middleware and routes.

* **`server.js`** ▶️ Start Button
  Starts the server and listens on a port.
  
## Frontend (`public/`) — The Dining Room

**Purpose:** Everything the browser runs and displays.

* **HTML files** 🖼️ Plates
  Page structure and placeholders.

* **`css/`** 🎨 Decoration
  Styling and layout.

* **`js/`** 🤖 Customer
  Fetches data, updates the DOM, stores state.

## Data Flow

Browser → Route → Controller → Repository → Controller → Browser


---


# 🗺️ The Project Map Guide: How Our Code Is Organized

Our codebase is divided into two distinct worlds:

* **The Kitchen** which is the Backend
* **The Dining Room** which is the Frontend

Each part has a clear role, and each file knows exactly what it is responsible for.

## 📂 `src/`

### The Kitchen (Backend)

This is where the server lives. It handles logic, data, and rules. The browser never sees this code.

### `src/db/` 🔌

**Analogy:** The Power Socket

This folder establishes the connection to our SQLite database. Everything else depends on it.

* `db.js` opens the database connection
* `query.js` provides helper utilities

You usually touch this only during setup.

### `src/repositories/` 📚

**Analogy:** The Librarian

This layer talks directly to the database. It contains raw SQL and nothing else.

* Runs queries like `SELECT` and `INSERT`
* Knows tables and columns
* Has no idea what HTTP requests or users are

Example:
`room.repo.js` exposes `getAllRooms()` which runs `SELECT * FROM rooms`.

Rule of thumb: SQL belongs here and nowhere else.

### `src/services/` 🧠

**Analogy:** The Manager

Services hold business logic and decision making. They exist to keep controllers simple.

Use this layer when a feature involves multiple steps or rules, such as validating bookings or checking credentials.

Example:
`auth.service.js` verifies passwords and handles authentication logic.

For very simple features, you can skip this layer.

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

* **`app.js`** is the Rulebook

  * Registers middleware
  * Enables JSON
  * Attaches routes

* **`server.js`** is the Start Button

  * Imports the app
  * Starts listening on a port

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
2. The router matches the URL to a controller
3. The controller asks the repository for data
4. The repository runs a SQL query
5. The controller returns JSON
6. The browser renders the result as HTML

That is the full loop from click to content.
