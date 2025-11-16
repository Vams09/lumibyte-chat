// backend/mockData.js
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

// Load persisted data or initialize default
let persisted = { sessions: [], conversations: {} };
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    persisted = JSON.parse(raw) || persisted;
  } else {
    // seed with sample data when file missing
    persisted.sessions = [
      { id: "session-1", title: "Project planning ideas", createdAt: new Date().toISOString() },
      { id: "session-2", title: "API design notes", createdAt: new Date().toISOString() }
    ];
    persisted.conversations = {
      "session-1": [
        { id: uuidv4(), sender: "bot", text: "Welcome! Ask me anything about project planning.", timestamp: new Date().toISOString() }
      ],
      "session-2": [
        { id: uuidv4(), sender: "bot", text: "API design ideas: REST vs GraphQL — ask a specific question.", timestamp: new Date().toISOString() }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(persisted, null, 2));
  }
} catch (err) {
  console.error("Failed to load persisted data:", err);
}

// Helpers to read/write persisted data
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(persisted, null, 2));
  } catch (err) {
    console.error("Failed to save data.json:", err);
  }
}

function getSessions() {
  return persisted.sessions;
}
function getConversations() {
  return persisted.conversations;
}

// create new session
function createNewSession() {
  const id = `sess-${Math.random().toString(36).slice(2, 9)}`;
  const title = "New Chat";
  const createdAt = new Date().toISOString();
  const newSession = { id, title, createdAt };
  persisted.sessions.unshift(newSession);
  persisted.conversations[id] = [
    { id: uuidv4(), sender: "bot", text: "New session created. How can I help?", timestamp: new Date().toISOString() }
  ];
  saveData();
  return newSession;
}

// rename session
function renameSession(sessionId, newTitle) {
  const s = persisted.sessions.find((x) => x.id === sessionId);
  if (!s) return null;
  s.title = newTitle;
  saveData();
  return s;
}

// delete session
function deleteSession(sessionId) {
  persisted.sessions = persisted.sessions.filter((s) => s.id !== sessionId);
  delete persisted.conversations[sessionId];
  saveData();
  return true;
}

// get last updated timestamp
function getLastUpdated(sessionId) {
  const conv = persisted.conversations[sessionId];
  if (!conv || conv.length === 0) return null;
  return conv[conv.length - 1].timestamp || null;
}

// handle a chat (push user message + bot reply)
function handleChat(sessionId, question) {
  if (!persisted.conversations[sessionId]) {
    // create conversation skeleton and session entry if missing
    persisted.conversations[sessionId] = [
      { id: uuidv4(), sender: "bot", text: "Starting a new conversation.", timestamp: new Date().toISOString() }
    ];
    if (!persisted.sessions.find((s) => s.id === sessionId)) {
      persisted.sessions.unshift({
        id: sessionId,
        title: "New Chat",
        createdAt: new Date().toISOString()
      });
    }
  }

  const userMsg = {
    id: uuidv4(),
    sender: "user",
    text: question,
    timestamp: new Date().toISOString()
  };
  persisted.conversations[sessionId].push(userMsg);

  const answer = {
    id: uuidv4(),
    sender: "bot",
    text: `Mock answer for: "${question}"`,
    timestamp: new Date().toISOString(),
    structured: {
      headers: ["Metric", "Value"],
      rows: [
        ["Question Length", String(question.length)],
        ["Words", String(question.split(/\s+/).filter(Boolean).length)],
        ["Confidence", "0.85 (mock)"]
      ]
    }
  };

  persisted.conversations[sessionId].push(answer);
  saveData();

  return answer;
}

// save feedback for a particular message (append to a message.feedbacks array)
function addFeedback(sessionId, messageId, feedback) {
  const conv = persisted.conversations[sessionId];
  if (!conv) return null;
  const msg = conv.find((m) => m.id === messageId);
  if (!msg) return null;
  msg.feedback = msg.feedback || [];
  msg.feedback.push({ id: uuidv4(), at: new Date().toISOString(), feedback });
  saveData();
  return msg;
}

module.exports = {
  getSessions,
  getConversations,
  createNewSession,
  handleChat,
  renameSession,
  deleteSession,
  getLastUpdated,
  addFeedback
};
