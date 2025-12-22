/* Purpose: Functions to hash passwords (using crypto.scrypt) and helpers to decode Basic Authentication headers. */

/**
 * 🔐 SECURITY UTILS (SIMPLE VERSION, MIGHT ADD HASHING, SALTING AND PEPPERING LATER IF TIME ALLOWS)
 * * CURRENT PURPOSE:
 * Handle Basic Auth decoding.
 * * SCOPE:
 * - decodeBasicAuth(header) -> Returns { email, password }
 * - verifyPassword(inputPassword, storedPassword) -> Returns true/false
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
 * Verifies if the input password matches the stored password.
 * @param {string} inputPassword - The password the user provided.
 * @param {string} storedPassword - The password stored in the database.
 * @returns {boolean} True if the input password matches the stored password, false otherwise.
 */
export const verifyPassword = (inputPassword, storedPassword) => {
  return inputPassword === storedPassword;
};
