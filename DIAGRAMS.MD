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

    Note right of Middleware: 🛡️ Basic Auth: The Bouncer decodes the Authorization header<br/>and verifies credentials against the Users table on every request.

    Note over User, Frontend: Phase 1: The Order
    User->>Frontend: Clicks "Book Room"
    Frontend->>Frontend: Retrieves Base64 credentials<br/>(Finds "Basic Auth" string in localStorage)
    Frontend->>Middleware: POST /api/bookings Headers: { Authorization: "Basic YW5kcmU..." }

    Note over Middleware, Controller: Phase 2: Security Check
    Middleware->>DB: SELECT * FROM users WHERE email = "..."
    alt Invalid Credentials?
        Middleware-->>Frontend: 401 Unauthorized ⛔
    else Valid Credentials
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
        LS[("Credentials / localStorage")]
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
    Browser -- 1. Reads Credentials --> LS
    Browser -- 2. Sends HTTP Request with Basic Auth --> App

    App --> Route
    Route --> MW
    MW -- Verifies Email/Password --> DB
    MW -- If Valid --> Ctrl

    Ctrl -- Asks for Data --> Repo
    Repo -- SQL Query --> DB

    DB -- Raw Data --> Repo
    Repo -- Data --> Ctrl
    Ctrl -- JSON Response --> Browser
    Browser -- Updates UI --> User
```
