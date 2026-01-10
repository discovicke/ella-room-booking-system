PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     email TEXT NOT NULL UNIQUE,
                                     password_hash TEXT NOT NULL,
                                     role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
                                     class TEXT,
                                     display_name TEXT
);

CREATE TABLE IF NOT EXISTS rooms (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     room_number TEXT NOT NULL UNIQUE,
                                     type TEXT NOT NULL CHECK (type IN ('classroom', 'lab', 'publicarea')),
                                     capacity INTEGER NOT NULL,
                                     location TEXT,
                                     floor_number INTEGER
);

CREATE TABLE IF NOT EXISTS room_assets (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           room_id INTEGER NOT NULL,
                                           asset TEXT NOT NULL,
                                           FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        room_id INTEGER NOT NULL,
                                        user_id INTEGER NOT NULL,
                                        start_time TEXT NOT NULL,
                                        end_time TEXT NOT NULL,
                                        status TEXT NOT NULL CHECK (status IN ('active', 'cancelled')),
                                        notes TEXT,
                                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                                        updated_at TEXT NOT NULL DEFAULT (datetime('now')),

                                        FOREIGN KEY (room_id) REFERENCES rooms(id),
                                        FOREIGN KEY (user_id) REFERENCES users(id),

                                        CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS sessions (
                                        id INTEGER PRIMARY KEY,
                                        user_id INTEGER NOT NULL,
                                        session_token TEXT NOT NULL UNIQUE,
                                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                                        expires_at TEXT NOT NULL,
                                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);

CREATE INDEX IF NOT EXISTS idx_bookings_room_time
    ON bookings (room_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_bookings_user
    ON bookings (user_id);

CREATE TRIGGER IF NOT EXISTS bookings_set_updated_at
    AFTER UPDATE ON bookings
    FOR EACH ROW
BEGIN
    UPDATE bookings
    SET updated_at = datetime('now')
    WHERE id = NEW.id;
END;