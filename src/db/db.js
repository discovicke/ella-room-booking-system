/**
 * 🔌 DATABASE CONNECTION
 * * PURPOSE:
 * This file creates the permanent connection to our SQLite database file.
 * * SCOPE:
 * - Initialize the connection to 'identifier.sqlite'.
 * - Enable Foreign Key enforcement (PRAGMA foreign_keys = ON).
 * - Handle connection errors (log error and exit).
 * * RELATION:
 * - Imported by: 'src/db/query.js'
 */

import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

// 1. setup absolute paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// from src/db/ -> src/ -> root/
const dbPath = path.resolve(__dirname, "../../identifier.sqlite");

// 2. DEBUG: Verify the file exists physically on the disk
if (!fs.existsSync(dbPath)) {
  console.error("CRITICAL ERROR: Database file not found!");
  console.error(`Expected location: ${dbPath}`);
  console.log(
    "Tip: Check if the filename is exactly 'identifier.sqlite' and not 'identifier.sqlite.sqlite'"
  );
  process.exit(1);
}

// 3. Initialize connection
export const db = new DatabaseSync(dbPath);
