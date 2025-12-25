/**
 * 📚 SESSION REPOSITORY
 * * PURPOSE:
 * Handles access to the "sessions" table.
 * * SCOPE:
 * - Function: createSession(user_id, token, expires_at) -> INSERT new session
 * - Function: validateSession(token) -> SELECT * FROM sessions WHERE token = ? AND expires_at > NOW
 * - Function: deleteSession(token) -> DELETE session (for logout)
 * - Function: deleteUserSessions(user_id) -> DELETE all sessions for a user (logout all devices)
 * - Function: cleanupExpiredSessions() -> DELETE expired sessions (automatic cleanup)
 * * RELATION:
 * - Imports: 'src/db/db.js'
 * - Imported by: 'src/controllers/auth.controller.js', 'src/middleware/authentication.middleware.js', 'src/server.js'
 */

import { db } from "../db/db.js";

/**
 * Creates a new session in the database.
 *
 * @param {number} user_id - The ID of the user for whom the session is created
 * @param {string} token - The session token
 * @param {Date} expires_at - The expiration date and time of the session
 * @returns {number} The ID of the newly created session (lastInsertRowid)
 */
export function createSession(user_id, token, expires_at) {
  const stmt = `
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `;
  const result = db.prepare(stmt).run(user_id, token, expires_at.toISOString());
  return result.lastInsertRowid;
}

/**
 * Validates a session token by checking if it exists and hasn't expired.
 *
 * @param {string} token - The session token to validate
 * @returns {Object|undefined} The session object if valid, undefined otherwise
 */
export function validateSession(token) {
  const stmt = `
    SELECT * FROM sessions
    WHERE token = ? AND expires_at > datetime('now')
  `;
  const session = db.prepare(stmt).get(token);
  return session;
}

/**
 * Deletes a session from the database.
 *
 * @param {string} token - The session token to delete
 * @returns {number} The number of rows affected (0 or 1)
 */
export function deleteSession(token) {
  const stmt = `DELETE FROM sessions WHERE token = ?`;
  const result = db.prepare(stmt).run(token);
  return result.changes;
}

/**
 * Deletes all sessions for a specific user (logout from all devices).
 *
 * @param {number} user_id - The ID of the user whose sessions should be deleted
 * @returns {number} The number of rows affected
 */
export function deleteUserSessions(user_id) {
  const stmt = `DELETE FROM sessions WHERE user_id = ?`;
  const result = db.prepare(stmt).run(user_id);
  return result.changes;
}

/**
 * Cleans up expired sessions from the database.
 *
 * @returns {number} The number of expired sessions deleted
 */
export function cleanupExpiredSessions() {
  const stmt = `DELETE FROM sessions WHERE expires_at < datetime('now')`;
  const result = db.prepare(stmt).run();
  return result.changes;
}
