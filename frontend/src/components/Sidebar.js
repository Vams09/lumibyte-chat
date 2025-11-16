import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [loadingNew, setLoadingNew] = useState(false);

  async function loadSessions() {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data || []);
    } catch (err) {
      console.error("Error loading sessions:", err);
      setSessions([]);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleNewChat() {
    try {
      setLoadingNew(true);
      const res = await fetch("/api/new-chat");
      const data = await res.json();
      navigate(`/chat/${data.id}`);
    } catch (err) {
      console.error("Failed to create new chat", err);
      const fallback = `local-${Date.now()}`;
      navigate(`/chat/${fallback}`);
    } finally {
      setLoadingNew(false);
      // reload sessions so sidebar shows the new one
      setTimeout(loadSessions, 200);
    }
  }

  async function handleRename(sessionId) {
    const newTitle = window.prompt("New name for this session?");
    if (!newTitle) return;
    try {
      const res = await fetch(`/api/session/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Rename failed");
      await loadSessions();
    } catch (err) {
      console.error("Rename error", err);
      alert("Rename failed");
    }
  }

  async function handleDelete(sessionId) {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/session/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // if current route is the deleted session, navigate home
      if (location.pathname === `/chat/${sessionId}`) navigate("/");
      await loadSessions();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  }

  return (
    <aside className="w-64 p-4 bg-gray-50 dark:bg-gray-900 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Sessions</h2>
        <button
          onClick={handleNewChat}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          type="button"
          disabled={loadingNew}
        >
          {loadingNew ? "..." : "New Chat"}
        </button>
      </div>

      <nav className="space-y-2">
        {sessions.length === 0 && (
          <div className="text-sm text-gray-500">No sessions yet — create one.</div>
        )}

        {sessions.map((s) => {
          const active = location.pathname === `/chat/${s.id}`;
          return (
            <div key={s.id} className="flex items-center justify-between">
              <Link
                to={`/chat/${s.id}`}
                className={`flex-1 block p-2 mr-2 rounded ${
                  active ? "bg-blue-600 text-white" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="text-sm font-medium">{s.title || s.id}</div>
                {s.updated && (
                  <div className="text-xs text-gray-400">
                    {new Date(s.updated).toLocaleString()}
                  </div>
                )}
              </Link>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleRename(s.id)}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700"
                  type="button"
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                  type="button"
                >
                  Del
                </button>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
