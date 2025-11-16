// backend/server.js
const express = require("express");
const cors = require("cors");
const {
  getSessions,
  getConversations,
  createNewSession,
  handleChat,
  renameSession,
  deleteSession,
  getLastUpdated,
  addFeedback
} = require("./mockData");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// GET /api/sessions
app.get("/api/sessions", (req, res) => {
  const sessions = getSessions().map((s) => ({
    id: s.id,
    title: s.title,
    createdAt: s.createdAt,
    updated: getLastUpdated(s.id) || s.createdAt
  }));
  res.json(sessions);
});

// GET /api/new-chat
app.get("/api/new-chat", (req, res) => {
  const newSession = createNewSession();
  res.json({ id: newSession.id });
});

// GET /api/session/:id
app.get("/api/session/:id", (req, res) => {
  const id = req.params.id;
  const conversations = getConversations();
  const conv = conversations[id];
  if (!conv) return res.status(404).json({ error: "Session not found" });
  return res.json({ id, messages: conv });
});

// POST /api/chat/:id
app.post("/api/chat/:id", (req, res) => {
  const id = req.params.id;
  const { question } = req.body;
  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Question is required" });
  }
  const answer = handleChat(id, question);
  // return shape: { text, structured, messages }
  return res.json({ text: answer.text, structured: answer.structured, messages: getConversations()[id] });
});

// PUT /api/session/:id  -> rename
app.put("/api/session/:id", (req, res) => {
  const id = req.params.id;
  const { title } = req.body;
  if (!title || title.trim() === "") return res.status(400).json({ error: "Title is required" });
  const renamed = renameSession(id, title);
  if (!renamed) return res.status(404).json({ error: "Session not found" });
  return res.json(renamed);
});

// DELETE /api/session/:id
app.delete("/api/session/:id", (req, res) => {
  const id = req.params.id;
  const ok = deleteSession(id);
  if (!ok) return res.status(404).json({ error: "Session not found" });
  return res.json({ ok: true });
});

// POST /api/session/:id/feedback
app.post("/api/session/:id/feedback", (req, res) => {
  const id = req.params.id;
  const { messageId, feedback } = req.body;
  if (!messageId || !feedback) return res.status(400).json({ error: "messageId and feedback are required" });
  const updatedMsg = addFeedback(id, messageId, feedback);
  if (!updatedMsg) return res.status(404).json({ error: "Message or session not found" });
  return res.json({ ok: true, message: updatedMsg });
});

// root
app.get("/", (req, res) => res.send("Lumibyte mock API running (persistent)"));

app.listen(PORT, () => console.log(`Mock API server running on http://localhost:${PORT}`));
