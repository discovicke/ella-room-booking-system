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
import { db } from "../../db/db.js";

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

export function findUserByClass(classId) {
  const query = `SELECT * FROM users WHERE class = ?`;
  const users = db.prepare(query).all(classId);
  return users;
}
export function findUserByRole(role) {
  const query = `SELECT * FROM users WHERE role = ?`;
  const users = db.prepare(query).all(role);
  return users;
}
export function findUserByName(name) {
  const query = `SELECT * FROM users WHERE Display_name = ?`;
  const users = db.prepare(query).all(name);
  return users;
}
export function createUser(user) {
  const query = `
    INSERT INTO users (email, password_hash, role, Display_name, class)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = db
    .prepare(query)
    .run(
      user.email,
      user.password_hash,
      user.role,
      user.Display_name,
      user.class
    );
  return result.lastInsertRowid;
}
export function updateUser(id, user) {
  const query = `
    UPDATE users
    SET email = ?, password_hash = ?, role = ?, Display_name = ?, class = ?
    WHERE id = ?
  `;
  const result = db
    .prepare(query)
    .run(
      user.email,
      user.password_hash,
      user.role,
      user.Display_name,
      user.class,
      id
    );
  return result.changes;
}

export function deleteUser(id) {
  const query = `DELETE FROM users WHERE id = ?`;
  const result = db.prepare(query).run(id);
  return result.changes;
}
