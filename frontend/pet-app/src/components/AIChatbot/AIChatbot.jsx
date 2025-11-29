import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { aiApi } from "../../api/aiApi.js";
import CustomerLayout from "../DashBoard/CustomerLayout.jsx";
import ChatMessage from "./ChatMessage.jsx";
import SuggestedProducts from "./SuggestedProducts.jsx";
import { showError, showSuccess, showConfirm } from "../../utils/notifications.js";
import { Send, Trash2, Loader2 } from "lucide-react";

const AIChatbot = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Load pets and restore selectedPetId from localStorage
  useEffect(() => {
    const loadPets = async () => {
      try {
        const response = await api.get("/pets");
        setPets(response.data || []);

        // Restore selectedPetId from localStorage
        const savedPetId = localStorage.getItem("selectedPetId");
        if (savedPetId) {
          const petExists = response.data?.some((p) => p.id === savedPetId);
          if (petExists) {
            setSelectedPetId(savedPetId);
          }
        }
      } catch (error) {
        console.error("Error loading pets:", error);
      }
    };
    if (user) {
      loadPets();
    }
  }, [user]);

  // Load chat history when selectedPetId changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      setLoadingHistory(true);
      try {
        const response = await aiApi.getChatHistory(selectedPetId, 50);
        setMessages(response.history || []);
      } catch (error) {
        console.error("Error loading chat history:", error);
        showError("Lỗi", "Không thể tải lịch sử chat");
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [user, selectedPetId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save selectedPetId to localStorage when it changes
  useEffect(() => {
    if (selectedPetId) {
      localStorage.setItem("selectedPetId", selectedPetId);
    }
  }, [selectedPetId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMessage = {
      id: Date.now(),
      message: userMessage,
      is_user_message: true,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await aiApi.sendMessage(userMessage, selectedPetId);
      
      // Add AI response to UI
      const aiMessage = {
        id: Date.now() + 1,
        message: response.response,
        response: response.response,
        is_user_message: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      showError("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.");
      // Remove temp user message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const result = await showConfirm(
      "Xóa lịch sử chat",
      "Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat?",
      "Xóa",
      "Hủy"
    );

    if (result.isConfirmed) {
      try {
        await aiApi.deleteChatHistory(selectedPetId);
        setMessages([]);
        // Clear selectedPetId from localStorage
        localStorage.removeItem("selectedPetId");
        setSelectedPetId(null);
        showSuccess("Thành công", "Đã xóa lịch sử chat");
      } catch (error) {
        console.error("Error clearing history:", error);
        showError("Lỗi", "Không thể xóa lịch sử chat");
      }
    }
  };

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <CustomerLayout currentPage="ai-chat">
      <div className="flex flex-col h-full min-h-full">
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Chat with PetCare+ AI
          </h1>
          <p className="text-gray-600 text-sm">
            Get personalized pet care advice and product recommendations from our AI assistant.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Chọn thú cưng (tùy chọn để có tư vấn cá nhân hóa):
            </label>
            <select
              value={selectedPetId || ""}
              onChange={(e) => setSelectedPetId(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Không chọn</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species === "dog" ? "Chó" : pet.species === "cat" ? "Mèo" : pet.species})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition"
            title="Xóa lịch sử chat"
          >
            <Trash2 size={16} />
            <span>Xóa lịch sử</span>
          </button>
        </div>

        {/* Main Content Area - Fixed ratio 2:1 */}
        <div className="flex-1 flex space-x-6 min-h-0">
          {/* Chat Area - flex-[2] */}
          <div className="flex-[2] flex flex-col bg-white rounded-lg border border-gray-200 min-h-0">
            {/* Messages Container - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-green-500" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage key={message.id || message.created_at} message={message} />
                  ))}
                  {loading && (
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">AI</span>
                      </div>
                      <div className="bg-green-50 rounded-lg px-4 py-2 border border-green-100">
                        <Loader2 className="animate-spin text-green-500" size={16} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4 flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>Gửi</span>
                </button>
              </form>
            </div>
          </div>

          {/* Suggested Products Sidebar - flex-[1] */}
          <SuggestedProducts petId={selectedPetId} petSpecies={selectedPet?.species} />
        </div>
      </div>
    </CustomerLayout>
  );
};

export default AIChatbot;

