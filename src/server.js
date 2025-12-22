/**
 * 🚀 SERVER ENTRY POINT
 * PURPOSE: The "Start Button" for the application.
 */
import app from "./app.js";

const PORT = 80;

app.listen(PORT, () => {
  console.log(`🚀 Server is running and listening on port ${PORT}`);
});
