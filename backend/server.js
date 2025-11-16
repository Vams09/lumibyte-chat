// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const {
  sessions,
  conversations,
  createNewSession,
  handleChat,
} = require("./mockData");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API routes (same as before)
app.get("/api/sessions", (req, res) => res.json(sessions));
app.get("/api/new-chat", (req, res) => res.json(createNewSession()));
app.get("/api/session/:id", (req, res) => {
  const id = req.params.id;
  const conv = conversations[id];
  if (!conv) return res.status(404).json({ error: "Session not found" });
  return res.json({ id, conversation: conv });
});
app.post("/api/chat/:id", (req, res) => {
  const id = req.params.id;
  const { question } = req.body;
  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Question is required" });
  }
  const answer = handleChat(id, question);
  return res.json(answer);
});

// Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "frontend", "build");
  app.use(express.static(buildPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// root health
app.get("/", (req, res) => res.send("Lumibyte mock API running"));

app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
