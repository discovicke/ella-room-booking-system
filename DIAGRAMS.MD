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

    alt No Cookie Found?
        alt Is API Request?
            Auth-->>Frontend: 401 Unauthorized ⛔
        else Is HTML Page Request?
            Auth-->>Frontend: Redirect to /login ↩️
        end
    else Cookie Found
        Auth->>DB: SELECT * FROM sessions WHERE token = "..."

        alt Session Invalid/Expired?
             Auth-->>Frontend: 401 / Redirect
        else Session Valid
             Auth->>DB: SELECT * FROM users WHERE id = session.user_id
             Auth->>AuthZ: next() (User attached to req.user) ✅
        end
    end

    Note over AuthZ, Controller: Phase 3: Authorization
    alt Role Allowed?
        AuthZ->>Controller: next() ✅
    else Insufficient Role
        AuthZ-->>Frontend: 403 Forbidden ⛔
    end

    Note over Controller, DB: Phase 4: Processing
    Note right of Controller: ⚠️ No Conflict Check in Code
    Controller->>Controller: Validate Input Fields (User, Room, Time)

    alt Missing Fields?
        Controller-->>Frontend: 400 Bad Request ❌
    else Valid Input
        Controller->>Repo: createBooking(data)
        Repo->>DB: INSERT INTO bookings...
        DB-->>Repo: Success
        Repo-->>Controller: Returns Result
        Controller-->>Frontend: 201 Created (Empty Body)
        Frontend->>User: Alert("Bokning Skapad!")
        Frontend->>Frontend: Reload Room List
    end

    Note over User, Frontend: Phase 6: Logout
    User->>Frontend: Clicks "Logout"
    Frontend->>Frontend: Remove User from localStorage 🗑️
    Frontend->>Auth: POST /api/auth/logout (Cookie sent automatically)
    Auth->>DB: DELETE session (Using cookie token)
    Auth-->>Frontend: 200 OK + Set-Cookie: auth_token= (Max-Age=0)
    Frontend->>User: Redirect to Login
```

# The Architecture Diagram (Physical Structure)

```mermaid
graph TD
    subgraph Client ["🍽️ Dining Room (Frontend)"]
        User((👤 User))
        Browser["🖥️ Browser / public/"]
        Cookie[("🍪 HttpOnly Cookie (Auth Token)")]
        LS[("💾 localStorage (User Profile Data: Name, Role etc.)")]
    end

    subgraph Server ["The Kitchen (Backend)"]
        App["⚙️ App.js"]

        subgraph Logic ["The Staff"]
            CP["🍪 CookieParser"]
            MW["🛡️ Middleware (Auth + AuthZ)"]
            Route["📜 Routes"]
            Ctrl["🤵 Controllers"]
            Repo["📚 Repositories"]
        end

        DB[("💽 SQLite Database")]
    end

    %% Connections
    User -- Clicks Button --> Browser
    Browser -- 1. Reads User Info --> LS
    Browser -- 2. Auto-includes Cookie --> CP
    CP -- Parses req.cookies --> App

    App --> Route
    Route --> MW
    MW -- Validates Session in DB --> DB
    MW -- If Valid & Authorized --> Ctrl

    Ctrl -- 1. Validates Input --> Ctrl
    Ctrl -- 2. Inserts Data --> Repo
    Repo -- SQL Query (INSERT) --> DB

    DB -- Raw Data --> Repo
    Repo -- Data --> Ctrl
    Ctrl -- JSON Response (201 or 400) --> Browser
    Browser -- Updates UI --> User
```
