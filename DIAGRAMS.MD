# App Sequence Diagram (Who talks to who?)

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 User
    participant Frontend as 🖥️ Frontend (public/js)
    participant Middleware as 🛡️ Middleware (The Bouncer)
    participant Controller as 🤵 Controller (The Waiter)
    participant Repo as 📚 Repository (The Librarian)
    participant DB as 💽 Database (SQLite)

    Note right of Middleware: ⚠️ MVP Exception: The Bouncer checks the Database directly<br/>to validate the Wristband (skipping the Librarian).

    Note over User, Frontend: Phase 1: The Order
    User->>Frontend: Clicks "Book Room"
    Frontend->>Frontend: Checks localStorage<br/>(Finds "Wristband" Token: wkPv...73s)
    Frontend->>Middleware: POST /api/bookings Headers: { Authorization: "wkPv...73s" }

    Note over Middleware, Controller: Phase 2: Security Check
    Middleware->>DB: SELECT * FROM sessions WHERE token = "wkPv...73s"
    alt No Wristband / Invalid?
        Middleware-->>Frontend: 401 Unauthorized ⛔
    else Valid Wristband
        Middleware->>Controller: next() (User ID attached) ✅
    end

    Note over Controller, DB: Phase 3: Processing
    Controller->>Repo: createBooking(roomId, userId...)
    Repo->>DB: INSERT INTO bookings...
    DB-->>Repo: Success (Row ID: 42)
    Repo-->>Controller: Returns Result

    Note over Controller, User: Phase 4: Response
    Controller-->>Frontend: 201 Created (JSON)
    Frontend->>User: Alert("Booking Confirmed! 🎉")
    Frontend->>Frontend: Reloads Room List
```

# The Architecture Diagram (Physical Structure)

```mermaid
graph TD
    subgraph Client ["🍽️ Dining Room (Frontend)"]
        User((👤 User))
        Browser["🖥️ Browser / public/"]
        LS[("Wristband / localStorage")]
    end

    subgraph Server ["The Kitchen (Backend)"]
        App["⚙️ App.js / Server.js"]

        subgraph Logic ["The Staff"]
            MW["🛡️ Middleware"]
            Route["📜 Routes"]
            Ctrl["🤵 Controllers"]
            Repo["📚 Repositories"]
            Utils["🧰 Utils"]
        end

        DB[("💽 SQLite Database")]
    end

    %% Connections
    User -- Clicks Button --> Browser
    Browser -- 1. Reads --> LS
    Browser -- 2. Sends HTTP Request --> App

    App --> Route
    Route --> MW
    MW -- Checks Token --> DB
    MW -- If Valid --> Ctrl

    Ctrl -- Asks for Data --> Repo
    Repo -- SQL Query --> DB

    DB -- Raw Data --> Repo
    Repo -- Data --> Ctrl
    Ctrl -- JSON Response --> Browser
    Browser -- Updates UI --> User
```
