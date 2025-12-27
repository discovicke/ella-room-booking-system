/* Purpose: Functions to hash passwords (using crypto.scrypt) and helpers to decode Basic Authentication headers. */

import crypto from "crypto";
import { promisify } from "util";

const scrypt = promisify(crypto.scrypt);

/**
 * 🔐 SECURITY UTILS
 * * PURPOSE:
 * Handle password hashing with scrypt and Basic Auth decoding.
 * * SCOPE:
 * - hashPassword(password) -> Returns hashed password with salt
 * - verifyPassword(inputPassword, storedHash) -> Returns true/false
 * - decodeBasicAuth(header) -> Returns { email, password }
 */

/**
 * Decodes the Basic Authentication header into an object containing email and password.
 * If the header is invalid, returns null.
 * @param {string} authHeader - The Basic Authentication header, e.g. "Basic dXNlcjpZGVyaXQ6Og=="
 * @returns {{ email: string, password: string } | null}
 */
export const decodeBasicAuth = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return null;
  }

  const base64Credentials = authHeader.split(" ")[1];

  const decodedString = Buffer.from(base64Credentials, "base64").toString(
    "utf-8"
  );

  const [email, password] = decodedString.split(":");

  if (!email || !password) return null;

  return { email, password };
};

/**
 * Hashes a password using scrypt with a random salt.
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} The hashed password in format "salt:hash" (both base64 encoded).
 */
export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt.toString("base64")}:${derivedKey.toString("base64")}`;
};

/**
 * Verifies if the input password matches the stored hashed password.
 * Uses timing-safe comparison to prevent timing attacks.
 * @param {string} inputPassword - The password the user provided.
 * @param {string} storedHash - The hashed password stored in the database (format: "salt:hash").
 * @returns {Promise<boolean>} True if the input password matches the stored hash, false otherwise.
 */
export const verifyPassword = async (inputPassword, storedHash) => {
  try {
    const [saltBase64, hashBase64] = storedHash.split(":");
    if (!saltBase64 || !hashBase64) return false;

    const salt = Buffer.from(saltBase64, "base64");
    const storedHashBuffer = Buffer.from(hashBase64, "base64");

    const derivedKey = await scrypt(inputPassword, salt, 64);

    return crypto.timingSafeEqual(storedHashBuffer, derivedKey);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
};

/**
 * Generates a random session token using crypto.randomBytes.
 * @returns {string} A 32-byte random token encoded as hex string.
 */
export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
