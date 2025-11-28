import { prisma } from "../config/prisma.js";
import { generateAIResponse } from "../services/geminiService.js";
import crypto from "crypto";

// Send chat message and get AI response
export const sendChatMessage = async (req, res) => {
  try {
    const { message, pet_id } = req.body;
    const user_id = req.user.user_id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Verify pet belongs to user if pet_id provided
    if (pet_id) {
      const pet = await prisma.pet.findFirst({
        where: { id: pet_id, user_id },
      });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found or unauthorized" });
      }
    }

    // Save user message to chat history
    const userMessageId = crypto.randomBytes(12).toString("hex");
    
    // Save user message to chat history
    try {
      await prisma.chatHistory.create({
        data: {
          id: userMessageId,
          user_id,
          pet_id: pet_id || null,
          message: message.trim(),
          response: null,
          is_user_message: true,
        },
      });
    } catch (dbErr) {
      console.error("Error saving user message to chat history:", dbErr);
      // Continue even if save fails
    }

    // Generate AI response
    let aiResponse = "";
    try {
      aiResponse = await generateAIResponse(message.trim(), pet_id, user_id, prisma);
    } catch (err) {
      console.error("AI generation error:", err);
      aiResponse = "Xin lỗi, tôi không thể trả lời câu hỏi của bạn lúc này. Vui lòng thử lại sau hoặc liên hệ với bác sĩ thú y để được tư vấn.";
    }

    // Save AI response to chat history
    const aiMessageId = crypto.randomBytes(12).toString("hex");
    
    if (prisma.chatHistory) {
      try {
        await prisma.chatHistory.create({
          data: {
            id: aiMessageId,
            user_id,
            pet_id: pet_id || null,
            message: message.trim(),
            response: aiResponse,
            is_user_message: false,
          },
        });
      } catch (dbErr) {
        console.error("Error saving AI response to chat history:", dbErr);
        // Continue even if save fails
      }
    }

    res.json({
      response: aiResponse,
      chat_id: aiMessageId,
    });
  } catch (err) {
    console.error("Error in sendChatMessage:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { pet_id, limit = 50 } = req.query;

    const where = {
      user_id,
    };

    if (pet_id) {
      // Verify pet belongs to user
      const pet = await prisma.pet.findFirst({
        where: { id: pet_id, user_id },
      });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found or unauthorized" });
      }
      where.pet_id = pet_id;
    }

    const history = await prisma.chatHistory.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
      take: parseInt(limit),
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
    });

    // Reverse to show oldest first
    res.json(history.reverse());
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete chat history
export const deleteChatHistory = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { pet_id } = req.query;

    const where = {
      user_id,
    };

    if (pet_id) {
      // Verify pet belongs to user
      const pet = await prisma.pet.findFirst({
        where: { id: pet_id, user_id },
      });
      if (!pet) {
        return res.status(404).json({ error: "Pet not found or unauthorized" });
      }
      where.pet_id = pet_id;
    }

    await prisma.chatHistory.deleteMany({
      where,
    });

    res.json({ message: "Chat history deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

