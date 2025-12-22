/**
 * 📚 USER REPOSITORY
 * * PURPOSE:
 * Handles access to the "users" table.
 * * SCOPE:
 * - Function: findUserByEmail(email) -> SELECT * FROM users WHERE email = ?
 * - Used during login to verify if a user exists.
 * * RELATION:
 * - Imports: 'src/db/query.js'
 * - Imported by: 'src/controllers/auth.controller.js'
 */
import db from "../db/db.js";

const query = db.prepare("SELECT * FROM users");
const users = query.all();

console.log(users);
