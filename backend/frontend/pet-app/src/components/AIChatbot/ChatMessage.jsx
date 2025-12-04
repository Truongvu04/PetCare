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

  // Remove separator lines (---) before processing
  formatted = formatted.replace(/^-{3,}$/gm, "");

  // Remove excessive blank lines (3+ consecutive line breaks)
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  // Split into lines for processing
  const lines = formatted.split("\n");
  const processedLines = [];
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : "";

    // Skip empty lines
    if (!line) {
      if (inParagraph && nextLine) {
        // End current paragraph if next line exists
        processedLines.push("</p>");
        inParagraph = false;
      }
      continue;
    }

    // Handle markdown headings (### Heading)
    if (line.startsWith("### ")) {
      if (inParagraph) {
        processedLines.push("</p>");
        inParagraph = false;
      }
      const heading = line.replace(/^### /, "");
      processedLines.push(`<strong class="block mt-1.5 mb-0.5 text-base font-semibold">${heading}</strong>`);
      continue;
    }

    // Handle bullet points (* item or • item)
    if (line.match(/^[\*•]\s+/)) {
      if (!inParagraph) {
        processedLines.push("<p class='mb-0.5'>");
        inParagraph = true;
      }
      const bulletText = line.replace(/^[\*•]\s+/, "");
      processedLines.push(`<span class="block ml-2 mb-0">• ${bulletText}</span>`);
      continue;
    }

    // Skip separator lines (---) - remove them completely
    if (line.match(/^-{3,}$/)) {
      continue;
    }

    // Regular text line
    if (!inParagraph) {
      processedLines.push("<p class='mb-0.5'>");
      inParagraph = true;
    }

    // Convert **text** to <strong>text</strong> within the line
    let processedLine = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    
    // Add line break only if next line is not empty and not a special format
    if (nextLine && !nextLine.startsWith("### ") && !nextLine.match(/^[\*•]\s+/)) {
      processedLine += " ";
    }
    
    processedLines.push(processedLine);
  }

  // Close any open paragraph
  if (inParagraph) {
    processedLines.push("</p>");
  }

  return processedLines.join("");
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
          className="text-sm break-words"
          style={{ lineHeight: "1.5" }}
          dangerouslySetInnerHTML={{ __html: formattedText }}
        />
        <div
          className={`text-xs mt-2 ${
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

