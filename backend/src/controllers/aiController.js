import { prisma } from "../config/prisma.js";
import { generateAIResponse } from "../services/geminiService.js";

/**
 * Send message and get AI response
 * POST /api/ai/chat
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, pet_id } = req.body;
    const userId = req.user.user_id;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message, userId, pet_id || null);

    // Save user message
    await prisma.chatHistory.create({
      data: {
        user_id: userId,
        pet_id: pet_id || null,
        message: message.trim(),
        is_user_message: true,
      },
    });

    // Save AI response
    await prisma.chatHistory.create({
      data: {
        user_id: userId,
        pet_id: pet_id || null,
        message: aiResponse,
        response: aiResponse,
        is_user_message: false,
      },
    });

    return res.json({
      success: true,
      response: aiResponse,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      message: "Error generating AI response",
      error: error.message,
    });
  }
};

/**
 * Get chat history
 * GET /api/ai/chat/history
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { pet_id, limit = 50 } = req.query;

    const whereClause = { user_id: userId };
    if (pet_id) {
      whereClause.pet_id = pet_id;
    }

    const history = await prisma.chatHistory.findMany({
      where: whereClause,
      orderBy: {
        created_at: "asc",
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

    return res.json({
      success: true,
      history: history,
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    return res.status(500).json({
      message: "Error fetching chat history",
      error: error.message,
    });
  }
};

/**
 * Delete chat history
 * DELETE /api/ai/chat/history
 */
export const deleteChatHistory = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { pet_id } = req.query;

    const whereClause = { user_id: userId };
    if (pet_id) {
      whereClause.pet_id = pet_id;
    }

    await prisma.chatHistory.deleteMany({
      where: whereClause,
    });

    return res.json({
      success: true,
      message: "Chat history deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteChatHistory:", error);
    return res.status(500).json({
      message: "Error deleting chat history",
      error: error.message,
    });
  }
};



