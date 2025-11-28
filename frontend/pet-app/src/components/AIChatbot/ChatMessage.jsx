import React from "react";
import { Bot, User } from "lucide-react";

// Format message text: convert markdown-style formatting to HTML
const formatMessage = (text) => {
  if (!text) return "";

  // Helper function to escape HTML (but preserve our markdown placeholders)
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  };

  // Split by lines to process bullet points first
  const lines = text.split("\n");
  const processedLines = [];
  let inList = false;
  let listItems = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    // Check if line is a bullet point (starts with * or -)
    if (trimmedLine.match(/^[\*\-\•]\s+/)) {
      if (!inList && listItems.length > 0) {
        // Close previous list if exists
        processedLines.push({ type: "list", items: [...listItems] });
        listItems = [];
      }
      inList = true;
      const itemText = trimmedLine.replace(/^[\*\-\•]\s+/, "");
      listItems.push(itemText);
    } else {
      if (inList && listItems.length > 0) {
        // Close current list
        processedLines.push({ type: "list", items: [...listItems] });
        listItems = [];
        inList = false;
      }
      if (trimmedLine) {
        processedLines.push({ type: "text", content: trimmedLine });
      } else {
        processedLines.push({ type: "break" });
      }
    }
  });

  // Close any remaining list
  if (inList && listItems.length > 0) {
    processedLines.push({ type: "list", items: [...listItems] });
  }

  // Convert to HTML
  const htmlParts = processedLines.map((item) => {
    if (item.type === "list") {
      const listItemsHtml = item.items
        .map((itemText) => {
          // Escape HTML and convert **bold**
          const escaped = escapeHtml(itemText);
          const bolded = escaped.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold'>$1</strong>");
          return `<li class="leading-relaxed">${bolded}</li>`;
        })
        .join("");
      return `<ul class="list-disc list-inside space-y-2.5 my-3 ml-5">${listItemsHtml}</ul>`;
    } else if (item.type === "text") {
      // Escape HTML and convert **bold**
      const escaped = escapeHtml(item.content);
      const bolded = escaped.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold'>$1</strong>");
      return `<p class="mb-3 last:mb-0 leading-relaxed">${bolded}</p>`;
    } else {
      return "<br />";
    }
  });

  return htmlParts.join("");
};

const ChatMessage = ({ message, isUser }) => {
  const formattedMessage = isUser ? message : formatMessage(message);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-[92%] ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? "bg-green-600" 
            : "bg-green-100"
        }`}>
          {isUser ? (
            <User className="text-white" size={20} />
          ) : (
            <Bot className="text-green-600" size={20} />
          )}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          {!isUser && (
            <span className="text-xs font-medium text-gray-600 mb-1 px-1">
              PetCare+ AI
            </span>
          )}
          <div
            className={`rounded-2xl px-6 py-4 shadow-sm ${
              isUser
                ? "bg-green-600 text-white rounded-br-sm"
                : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
            }`}
          >
            {isUser ? (
              <p className="text-base whitespace-pre-wrap leading-relaxed">{message}</p>
            ) : (
              <div 
                className="text-base"
                dangerouslySetInnerHTML={{ __html: formattedMessage }}
                style={{
                  lineHeight: "1.75",
                }}
              />
            )}
          </div>
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
