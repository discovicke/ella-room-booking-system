/**
 * 🚀 SERVER ENTRY POINT
 * PURPOSE: The "Start Button" for the application.
 */
import app from "./app.js";
import { cleanupExpiredSessions } from "./modules/auth/session.repo.js";

const PORT = 80;

// Clean up expired sessions every 24 hours
setInterval(() => {
  const deleted = cleanupExpiredSessions();
  console.log(`🧹 Cleaned up ${deleted} expired session(s)`);
}, 24 * 60 * 60 * 1000);

// Run cleanup on server start
const initialCleanup = cleanupExpiredSessions();
console.log(`🧹 Initial cleanup: Removed ${initialCleanup} expired session(s)`);

app.listen(PORT, () => {
  console.log(`🚀 Server is running and listening on port ${PORT}`);
});
