/**
 * ⚙️ APP CONFIGURATION
 * PURPOSE: The main "Rulebook" for the Express application.
 */
import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("src/public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
