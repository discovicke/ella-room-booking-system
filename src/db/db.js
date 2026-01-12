/**
 * 🔌 DATABASE CONNECTION
 * * PURPOSE:
 * This file creates the permanent connection to our SQLite database file.
 * * SCOPE:
 * - Initialize the connection to 'identifier.sqlite'.
 * - Enable Foreign Key enforcement (PRAGMA foreign_keys = ON).
 * - Handle connection errors (log error and exit).
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { hashPassword } from "../utils/security.utils.js";

// 1. setup absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// from src/db/ -> src/ -> root/
const dbPath = path.resolve(__dirname, "../../data/identifier.sqlite");

// 2. DEBUG: Verify the file exists physically on the disk
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

// 3. Initialize connection
export const db = new DatabaseSync(dbPath);

// Enable Write-Ahead Logging (WAL) mode for better concurrency.
// WAL allows multiple readers to access the database simultaneously while a writer is active,
// improving performance for applications with concurrent read/write operations.
db.exec("PRAGMA journal_mode = WAL;");

// Enable foreign key constraints enforcement.
// By default, SQLite does NOT enforce foreign key relationships even if they're defined in the schema.
// This pragma ensures referential integrity is maintained (prevents orphaned records, enforces CASCADE rules).
db.exec("PRAGMA foreign_keys = ON;");

// schema
const schemaPath = path.resolve(__dirname, "../../db/schema.sql");
db.exec(fs.readFileSync(schemaPath, "utf8"));

// seed (kör bara om inga users finns)
const userCount = db.prepare("SELECT COUNT(*) AS count FROM users").get();

if (userCount.count === 0) {
  // Wrap in async IIFE to handle async hashPassword calls
  await (async () => {
    try {
      console.log("📦 Seeding database with initial data...");

      // Read the seed SQL template
      let seedSql = fs.readFileSync(
          path.resolve(__dirname, "../../db/seed.sql"),
          "utf8"
      );

      // Generate a unique hash for each user
      // We need to hash the password multiple times since each user needs their own salt
      const password = "lösen123";
      console.log("🔐 Hashing passwords for 9 users...");

      const hashes = await Promise.all([
        hashPassword(password), // admin@edugrade.com
        hashPassword(password), // larare@edugrade.com
        hashPassword(password), // elev@edugrade.com
        hashPassword(password), // anette.johansson@edugrade.com
        hashPassword(password), // oscar.marcusson@edugrade.com
        hashPassword(password), // andre.ponten@edu.edugrade.com
        hashPassword(password), // christian.gennari@edu.edugrade.com
        hashPassword(password), // marcus.loov@edu.edugrade.com
        hashPassword(password), // viktor.johansson@edu.edugrade.com
      ]);

      console.log("✅ Password hashing complete");

      // Replace each __HASH__ placeholder with a unique hash
      let hashIndex = 0;
      seedSql = seedSql.replace(/__HASH__/g, () => hashes[hashIndex++]);

      console.log("📝 Executing seed SQL...");
      db.exec(seedSql);

      console.log(`✅ Database seeded with ${hashes.length} users`);

    } catch (error) {
      console.error("❌ Error seeding database:", error);
      console.error("Stack trace:", error.stack);
      throw error; // Re-throw to prevent server from starting with broken DB
    }
  })();
}
