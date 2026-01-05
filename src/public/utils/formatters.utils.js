/**
 * Capitalizes the first character of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The string with the first character capitalized, or an empty string if input is falsy.
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a date value into a localized date and time string.
 * @param {string|Date|number} value - The date value to format (ISO string, Date object, or timestamp).
 * @returns {string} The formatted date and time string in Swedish locale (sv-SE), or "-" if value is falsy.
 */
export function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
