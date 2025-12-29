# App Sequence Diagram (Who talks to who?)

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 User
    participant Frontend as 🖥️ Frontend (Browser)
    participant Auth as 🛡️ Authentication (The Bouncer)
    participant AuthZ as 🔐 Authorization (The Gatekeeper)
    participant Controller as 🤵 Controller (The Waiter)
    participant Repo as 📚 Repository (The Librarian)
    participant DB as 💽 Database (SQLite)

    Note right of Auth: 🛡️ Strict Auth: Checks HttpOnly Cookie ONLY.

    Note over User, Frontend: Phase 1: The Order
    User->>Frontend: Clicks "Book Room"
    Frontend->>Auth: POST /api/bookings (Browser sends Cookie automatically)

    Note over Auth, Controller: Phase 2: Authentication
    Auth->>Auth: Check req.cookies.auth_token
    Auth->>DB: SELECT * FROM sessions WHERE token = "..."

    alt Invalid or No Token?
        alt Is API Request?
            Auth-->>Frontend: 401 Unauthorized ⛔
        else Is HTML Page Request?
            Auth-->>Frontend: Redirect to /login ↩️
        end
    else Valid Token
        Auth->>DB: SELECT * FROM users WHERE id = session.user_id
        Auth->>AuthZ: next() (User attached to req.user) ✅
    end

    Note over AuthZ, Controller: Phase 3: Authorization
    alt Role Allowed?
        AuthZ->>Controller: next() ✅
    else Insufficient Role
        AuthZ-->>Frontend: 403 Forbidden ⛔
    end

    Note over Controller, DB: Phase 4: Processing & Validation
    Controller->>Repo: checkRoomExists(id)

    Note right of Controller: 🛑 CRITICAL CHECK
    Controller->>Repo: findConflictingBookings(room, start, end)
    Repo->>DB: SELECT * FROM bookings WHERE ...
    DB-->>Repo: Returns Array of Conflicts

    alt Booking Overlaps?
        Controller-->>Frontend: 409 Conflict ("Room already booked!") ❌
        Frontend->>User: Alert("Rummet är upptaget!")
    else Room Free
        Controller->>Repo: createBooking(...)
        Repo->>DB: INSERT INTO bookings...
        DB-->>Repo: Success
        Repo-->>Controller: Returns Result
        Controller-->>Frontend: 201 Created (JSON)
        Frontend->>User: Alert("Bokning Bekräftad! 🎉")
        Frontend->>Frontend: Reload Room List
    end

    Note over User, Frontend: Phase 6: Logout
    User->>Frontend: Clicks "Logout"
    Frontend->>Auth: POST /api/auth/logout
    Auth->>DB: DELETE session (Using cookie token)
    Auth-->>Frontend: 200 OK + Set-Cookie: auth_token= (Max-Age=0)
```

# The Architecture Diagram (Physical Structure)

```mermaid
graph TD
    subgraph Client ["🍽️ Dining Room (Frontend)"]
        User((👤 User))
        Browser["🖥️ Browser / public/"]
        Cookie[("🍪 HttpOnly Cookie (Auth Token)")]
        LS[("User Data / localStorage")]
    end

    subgraph Server ["The Kitchen (Backend)"]
        App["⚙️ App.js"]

        subgraph Logic ["The Staff"]
            CP["🍪 CookieParser"]
            MW["🛡️ Middleware (Auth + AuthZ)"]
            Route["📜 Routes"]
            Ctrl["🤵 Controllers"]
            Repo["📚 Repositories"]
            Utils["🧰 Utils"]
        end

        DB[("💽 SQLite Database")]
    end

    %% Connections
    User -- Clicks Button --> Browser
    Browser -- 1. Auto-includes Cookie --> CP
    CP -- Parses req.cookies --> App

    App --> Route
    Route --> MW
    MW -- Validates Session in DB --> DB
    MW -- If Valid & Authorized --> Ctrl

    Ctrl -- 1. Checks Room Exists --> Repo
    Ctrl -- 2. Checks Overlaps --> Repo
    Repo -- SQL Query --> DB

    DB -- Raw Data --> Repo
    Repo -- Data --> Ctrl
    Ctrl -- JSON Response (or 409 Conflict) --> Browser
    Browser -- Updates UI --> User
```
