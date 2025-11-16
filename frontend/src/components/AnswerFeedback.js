import React, { useState } from "react";

export default function AnswerFeedback({ sessionId, messageId }) {
  const [liked, setLiked] = useState(null);
  const [sending, setSending] = useState(false);

  async function sendFeedback(value) {
    if (!sessionId || !messageId) {
      console.warn("Missing sessionId or messageId for feedback");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/session/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, feedback: value }),
      });
      if (!res.ok) throw new Error("Feedback failed");
      setLiked(value);
    } catch (err) {
      console.error("Feedback error", err);
      alert("Failed to send feedback");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-2 flex gap-2 items-center text-sm">
      <button
        type="button"
        onClick={() => sendFeedback("like")}
        className={`px-2 py-1 rounded ${
          liked === "like" ? "bg-green-600 text-white" : "bg-gray-200 dark:bg-gray-700"
        }`}
        disabled={sending}
      >
        👍
      </button>

      <button
        type="button"
        onClick={() => sendFeedback("dislike")}
        className={`px-2 py-1 rounded ${
          liked === "dislike" ? "bg-red-600 text-white" : "bg-gray-200 dark:bg-gray-700"
        }`}
        disabled={sending}
      >
        👎
      </button>

      <div className="text-xs text-gray-500">
        {liked === null ? "Was this helpful?" : liked === "like" ? "Thanks!" : "We will improve."}
      </div>
    </div>
  );
}
