import React from "react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
      >
        {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
      </button>
    </div>
  );
}
