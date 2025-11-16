import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto p-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Lumibyte - Simplified Chat</h1>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        {/* Sidebar */}
        <div className="col-span-12 md:col-span-4">
          <Sidebar />
        </div>

        {/* Main chat area - routing */}
        <div className="col-span-12 md:col-span-8">
          <Routes>
            <Route
              path="/"
              element={
                <div className="p-6 bg-white dark:bg-gray-800 rounded shadow">
                  Welcome! Click "New Chat" or choose a session.
                </div>
              }
            />
            <Route path="/chat/:sessionId" element={<ChatWindow />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
