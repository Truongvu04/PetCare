import React, { useState, useEffect, useRef } from "react";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import { aiApi } from "../../api/aiApi.js";
import api from "../../api/axiosConfig.js";
import ChatMessage from "./ChatMessage.jsx";
import SuggestedProducts from "./SuggestedProducts.jsx";
import { Bot, Send, Trash2, User } from "lucide-react";
import Swal from "sweetalert2";

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(() => {
    // Load from localStorage on initial mount
    return localStorage.getItem("aiChatSelectedPetId") || "";
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    loadChatHistory();
  }, [selectedPetId]);

  // Save selectedPetId to localStorage whenever it changes
  useEffect(() => {
    if (selectedPetId) {
      localStorage.setItem("aiChatSelectedPetId", selectedPetId);
    } else {
      localStorage.removeItem("aiChatSelectedPetId");
    }
  }, [selectedPetId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadPets = async () => {
    try {
      const res = await api.get("/pets");
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPets(res.data);
        // Restore selected pet from localStorage if it exists and is valid
        const savedPetId = localStorage.getItem("aiChatSelectedPetId");
        if (savedPetId && res.data.find(p => p.id === savedPetId)) {
          setSelectedPetId(savedPetId);
        }
      }
    } catch (err) {
      console.error("Error loading pets:", err);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await aiApi.getChatHistory(selectedPetId || null);
      // Group consecutive messages by user/AI
      const groupedMessages = [];
      let currentGroup = null;

      history.forEach((msg) => {
        if (!currentGroup || currentGroup.isUser !== msg.is_user_message) {
          currentGroup = {
            id: msg.id,
            message: msg.is_user_message ? msg.message : msg.response || msg.message,
            isUser: msg.is_user_message,
            pet: msg.pet,
          };
          groupedMessages.push(currentGroup);
        } else {
          currentGroup.message += "\n" + (msg.is_user_message ? msg.message : msg.response || msg.message);
        }
      });

      setMessages(groupedMessages);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setLoading(true);

    // Add user message immediately
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      message: userMessage,
      isUser: true,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await aiApi.sendChatMessage(userMessage, selectedPetId || null);
      
      // Remove temp message and add real messages
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempUserMsg.id);
        return [
          ...filtered,
          {
            id: `user-${Date.now()}`,
            message: userMessage,
            isUser: true,
          },
          {
            id: response.chat_id,
            message: response.response,
            isUser: false,
          },
        ];
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== tempUserMsg.id);
        return [
          ...filtered,
          {
            id: `user-${Date.now()}`,
            message: userMessage,
            isUser: true,
          },
          {
            id: `error-${Date.now()}`,
            message: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
            isUser: false,
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const result = await Swal.fire({
      title: "Xác nhận xóa lịch sử",
      text: "Bạn có chắc muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await aiApi.deleteChatHistory(selectedPetId || null);
        setMessages([]);
        // Clear selected pet from localStorage when clearing chat history
        setSelectedPetId("");
        localStorage.removeItem("aiChatSelectedPetId");
        
        Swal.fire({
          title: "Đã xóa!",
          text: "Lịch sử chat đã được xóa thành công.",
          icon: "success",
          confirmButtonColor: "#16a34a",
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (err) {
        console.error("Error clearing chat history:", err);
        Swal.fire({
          title: "Lỗi!",
          text: "Không thể xóa lịch sử chat. Vui lòng thử lại sau.",
          icon: "error",
          confirmButtonColor: "#dc2626",
        });
      }
    }
  };

  return (
    <CustomerLayout currentPage="ai-chat">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Section */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
                Chat with PetCare+ AI
              </h2>
              <p className="text-sm text-gray-600">
                Get personalized pet care advice and product recommendations from our AI assistant.
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition"
                title="Xóa lịch sử chat"
              >
                <Trash2 size={16} />
                <span>Xóa lịch sử</span>
              </button>
            )}
          </div>

          {/* Pet Selector */}
          {pets.length > 0 && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Chọn thú cưng (tùy chọn để có tư vấn cá nhân hóa)
              </label>
              <select
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Không chọn</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Main Content Area - Two Columns */}
        <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
          {/* Chat Area - Left Side - Fixed ratio */}
          <div className="flex-[2] min-h-0 flex flex-col overflow-hidden">
            <div className="flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full min-h-0">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Bot className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Chào bạn! 👋
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Tôi là trợ lý AI của PetCare+. Tôi có thể giúp bạn về:
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md">
                    <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-gray-700">
                      💬 Lời nhắc chăm sóc
                    </div>
                    <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-gray-700">
                      🛍️ Sản phẩm phù hợp
                    </div>
                    <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-gray-700">
                      🏥 Dịch vụ thú y
                    </div>
                    <div className="px-4 py-2 bg-green-50 rounded-lg text-sm text-gray-700">
                      💡 Tư vấn chăm sóc
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-5xl mx-auto">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg.message} isUser={msg.isUser} />
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                          <span className="text-sm text-gray-600">AI đang suy nghĩ...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-5 bg-white flex-shrink-0">
              <form onSubmit={handleSend} className="flex items-end space-x-3 max-w-5xl mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Nhập câu hỏi của bạn..."
                    className="w-full px-5 py-3.5 pr-12 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  {inputMessage.trim() && (
                    <button
                      type="button"
                      onClick={() => setInputMessage("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="bg-green-600 text-white px-7 py-3.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-2 shadow-sm text-base font-medium"
                >
                  <Send size={20} />
                  <span>Gửi</span>
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Nhấn Enter để gửi • Shift + Enter để xuống dòng
              </p>
            </div>
          </div>
          </div>

          {/* Suggested Products - Right Sidebar - Fixed ratio */}
          <div className="flex-[1] min-h-0 flex-shrink-0 hidden lg:flex overflow-hidden">
            <SuggestedProducts 
              petId={selectedPetId || null} 
              petSpecies={pets.find(p => p.id === selectedPetId)?.species || null}
            />
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default AIChatbot;
