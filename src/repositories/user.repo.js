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
import {db} from "../db/db.js";

export function getAllUsers() {
  const query = `SELECT * FROM users`;
  const users = db.prepare(query).all();
  return users;
}

export function getUserById(id) {
  const query = `SELECT * FROM users WHERE id = ?`;
  const user = db.prepare(query).get(id);
  return user;
}

export function findUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = ?`;
  const user = db.prepare(query).get(email);
  return user;
}


console.log(getAllUsers());
