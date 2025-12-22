/**
 * 🤵 AUTH CONTROLLER
 * * PURPOSE:
 * Handles User Login verification.
 * * SCOPE:
 * - login(req, res):
 * 1. Get email/password from req.body.
 * 2. Ask userRepo for the user.
 * 3. Check if password matches (using hash comparison).
 * 4. If Match: Return success so the client can store credentials.
 * 5. If No Match: Return 401 Error.
 * * RELATION:
 * - This no longer generates tokens; it simply validates credentials for the client.
 */
