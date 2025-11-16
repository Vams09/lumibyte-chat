import React, { useState } from "react";

export default function ChatInput({ onSend }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSend(text);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type your message and press Enter"
        className="flex-1 px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
      />
      <button
        type="submit"
        className="px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
      >
        Send
      </button>
    </form>
  );
}
