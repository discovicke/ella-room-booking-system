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
  const result = db.prepare(query).run(
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
  const result = db.prepare(query).run(
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
// console.log(deleteUser(7))

console.log('TESTING USER OPERATIONS\n');
console.log('='.repeat(50));

// // ==================
// // TEST 1: CREATE USER
// // ==================
// console.log('\nTEST 1: Creating user...');
// try {
//     const newUser = {
//         email: 'testuser99@example.com',
//         password: 'hashed_password_123',
//         role: 'student',
//         Display_name: 'Test User 99',
//         class: 'TE4'
//     };
    
//     const userId = createUser(newUser);
//     console.log('User created successfully');
//     console.log('Created user ID:', userId);
    
//     if (userId !== 99) {
//         console.log('WARNING: User ID is', userId, 'not 99. Adjusting test to use actual ID.');
//     }
// } catch (error) {
//     console.log('ERROR creating user:', error.message);
// }

// // ==================
// // TEST 2: VERIFY USER CREATED
// // ==================
// console.log('\nTEST 2: Verify user created...');
// try {
//     const selectStmt = db.prepare('SELECT * FROM users WHERE email = ?');
//     const user = selectStmt.get('testuser99@example.com');
    
//     if (user) {
//         console.log('User found:', user);
//         console.log('Email:', user.email);
//         console.log('Role:', user.role);
//         console.log('Display name:', user.Display_name);
//         console.log('Class:', user.class);
//         console.log('PASS: User exists in database');
//     } else {
//         console.log('FAIL: User not found');
//     }
// } catch (error) {
//     console.log('ERROR verifying user:', error.message);
// }

// // ==================
// // TEST 3: UPDATE USER
// // ==================
// console.log('\nTEST 3: Updating user...');
// try {
//     const selectStmt = db.prepare('SELECT id FROM users WHERE email = ?');
//     const user = selectStmt.get('testuser99@example.com');
//     const userId = user.id;
    
//     const updatedUser = {
//         email: 'updated99@example.com',
//         password: 'new_hashed_password_456',
//         role: 'teacher',
//         Display_name: 'Updated Test User 99',
//         class: 'Staff'
//     };
    
//     const changes = updateUser(userId, updatedUser);
//     console.log('User updated successfully');
//     console.log('Rows changed:', changes);
// } catch (error) {
//     console.log('ERROR updating user:', error.message);
// }

// // ==================
// // TEST 4: VERIFY USER UPDATED
// // ==================
// console.log('\nTEST 4: Verify user updated...');
// try {
//     const selectStmt = db.prepare('SELECT * FROM users WHERE email = ?');
//     const user = selectStmt.get('updated99@example.com');
    
//     if (user) {
//         console.log('Updated user:', user);
//         console.log('Email changed:', user.email === 'updated99@example.com' ? 'YES' : 'NO');
//         console.log('Role changed:', user.role === 'teacher' ? 'YES' : 'NO');
//         console.log('Display name changed:', user.Display_name === 'Updated Test User 99' ? 'YES' : 'NO');
//         console.log('Class changed:', user.class === 'Staff' ? 'YES' : 'NO');
//         console.log('PASS: User updated correctly');
//     } else {
//         console.log('FAIL: User not found after update');
//     }
// } catch (error) {
//     console.log('ERROR verifying update:', error.message);
// }

// // ==================
// // TEST 5: DELETE USER
// // ==================
// console.log('\nTEST 5: Deleting user...');
// try {
//     const selectStmt = db.prepare('SELECT id FROM users WHERE email = ?');
//     const user = selectStmt.get('updated99@example.com');
//     const userId = user.id;
    
//     const deleteStmt = db.prepare('DELETE FROM users WHERE id = ?');
//     const result = deleteStmt.run(userId);
    
//     console.log('User deleted successfully');
//     console.log('Rows deleted:', result.changes);
// } catch (error) {
//     console.log('ERROR deleting user:', error.message);
// }

// // ==================
// // TEST 6: VERIFY USER DELETED
// // ==================
// console.log('\nTEST 6: Verify user deleted...');
// try {
//     const selectStmt = db.prepare('SELECT * FROM users WHERE email = ?');
//     const user = selectStmt.get('updated99@example.com');
    
//     if (user) {
//         console.log('FAIL: User still exists:', user);
//     } else {
//         console.log('User not found (expected)');
//         console.log('PASS: User deleted successfully');
//     }
// } catch (error) {
//     console.log('ERROR verifying deletion:', error.message);
// }
 

// console.log(finderUserByName('Marcus Lööv'));
// console.log(findUserByClass('net25'));
// console.log(findeUserByRole('teacher'));

// console.log(getAllUsers());
