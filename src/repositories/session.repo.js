/**
 * 📚 SESSION REPOSITORY
 * * PURPOSE:
 * Handles access to the "sessions" table.
 * * SCOPE:
 * - Function: findSessionByToken(token) -> SELECT ... FROM sessions JOIN users ...
 * - Verifies if a "Wristband" (Token) is valid and retrieves the owner.
 * * RELATION:
 * - Imports: 'src/db/query.js'
 * - Imported by: 'src/middleware/auth.middleware.js'
 */
