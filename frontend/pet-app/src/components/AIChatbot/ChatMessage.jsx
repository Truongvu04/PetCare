import React from "react";

/**
 * Format message to display markdown-style formatting
 */
const formatMessage = (text) => {
  if (!text) return "";

  // Escape HTML first
  const escapeHtml = (str) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return str.replace(/[&<>"']/g, (m) => map[m]);
  };

  let formatted = escapeHtml(text);

  // Convert **text** to <strong>text</strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Convert * at start of line to bullet points
  formatted = formatted.replace(/^\* (.+)$/gm, "• $1");

  // Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, "<br>");

  return formatted;
};

const ChatMessage = ({ message }) => {
  const isUser = message.is_user_message;
  const formattedText = formatMessage(message.message || message.response);

  return (
    <div
      className={`flex items-start space-x-3 mb-4 ${
        isUser ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-green-600 font-bold text-sm">AI</span>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-green-500 text-white"
            : "bg-green-50 text-gray-800 border border-green-100"
        }`}
      >
        <div
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
        <div
          className={`text-xs mt-1 ${
            isUser ? "text-green-100" : "text-gray-500"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;









