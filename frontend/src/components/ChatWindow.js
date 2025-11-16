import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "./ChatInput";
import TableResponse from "./TableResponse";
import AnswerFeedback from "./AnswerFeedback";

export default function ChatWindow() {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null); // for autofocus

  // Scroll to bottom on message or loading update
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Fetch session history
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/session/${sessionId}`);
        if (!res.ok) {
          setMessages([
            {
              id: "error-1",
              sender: "bot",
              text: "Session not found.",
              timestamp: new Date().toISOString(),
            },
          ]);
          return;
        }

        const data = await res.json();
        setMessages(data.messages || []);
        // autofocus the input after messages load
        setTimeout(() => {
          if (inputRef.current && inputRef.current.focus) inputRef.current.focus();
        }, 50);
      } catch (err) {
        setMessages([
          {
            id: "error",
            sender: "bot",
            text: "Failed to load session.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    }

    loadSession();
  }, [sessionId]);

  // Handle sending user message
  async function handleSend(userText) {
    if (!userText || !userText.trim()) return;

    const newUserMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString(),
    };

    // Optimistic add user message
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userText }),
      });

      const data = await res.json();

      const botMessage = {
        id: data.id || `bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "Bot response",
        structured: data.structured || null,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const fallback = {
        id: `err-${Date.now()}`,
        sender: "bot",
        text: "Sorry — an error occurred while fetching the answer.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
      // return focus to input
      setTimeout(() => {
        if (inputRef.current && inputRef.current.focus) inputRef.current.focus();
      }, 50);
    }
  }

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-xl font-semibold mb-4">
        Session: <span className="font-medium">{sessionId}</span>
      </h1>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto mb-4 space-y-4"
        style={{ maxHeight: "60vh" }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-3 rounded ${
                msg.sender === "user"
                  ? "bg-blue-100 dark:bg-blue-800"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {msg.text}

              {/* Structured table */}
              {msg.structured && (
                <div className="mt-2">
                  <TableResponse structured={msg.structured} />
                </div>
              )}

              {/* Feedback only for bot - pass sessionId & messageId */}
              {msg.sender === "bot" && (
                <div className="mt-2">
                  <AnswerFeedback sessionId={sessionId} messageId={msg.id} />
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 mt-1">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && <div className="text-left text-gray-400 italic">Bot typing…</div>}
      </div>

      {/* Input - pass ref and disabled when loading */}
      <ChatInput onSend={handleSend} disabled={loading} inputRef={inputRef} />
    </div>
  );
}
