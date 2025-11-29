import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../config/prisma.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model: Gemini 2.5 Flash (latest stable version)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Get pet context for AI prompt
 */
const getPetContext = async (petId) => {
  if (!petId) return "";

  try {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) return "";

    // Convert weight from lbs to kg for display
    const weightInKg = pet.weight ? (parseFloat(pet.weight) * 0.453592).toFixed(2) : null;

    return `
Thông tin thú cưng:
- Tên: ${pet.name}
- Loài: ${pet.species}
- Giống: ${pet.breed || "Không xác định"}
- Tuổi: ${pet.age || "Không xác định"} tuổi
- Cân nặng: ${weightInKg ? `${weightInKg} kg` : "Chưa cập nhật"}
- Lịch sử y tế: ${pet.medical_history || "Không có"}
- Mô tả: ${pet.description || "Không có"}
`;
  } catch (error) {
    console.error("Error fetching pet context:", error);
    return "";
  }
};

/**
 * Get reminders context for AI prompt
 */
const getRemindersContext = async (userId, petId = null) => {
  try {
    const whereClause = { pet: { user_id: userId } };
    if (petId) {
      whereClause.pet_id = petId;
    }

    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      include: {
        pet: {
          select: {
            name: true,
            species: true,
          },
        },
      },
      orderBy: {
        reminder_date: "asc",
      },
      take: 20, // Limit to recent 20 reminders
    });

    if (reminders.length === 0) return "";

    let context = "\nLời nhắc của người dùng:\n";
    reminders.forEach((reminder) => {
      const date = new Date(reminder.reminder_date).toLocaleDateString("vi-VN");
      context += `- ${reminder.pet.name} (${reminder.pet.species}): `;
      
      if (reminder.type === "vaccination" && reminder.vaccination_type) {
        context += `Tiêm chủng ${reminder.vaccination_type} vào ${date}`;
      } else if (reminder.type === "feeding" && reminder.feeding_time) {
        const time = new Date(`2000-01-01T${reminder.feeding_time}`).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        context += `Cho ăn lúc ${time} vào ${date}`;
      } else {
        context += `${reminder.type} vào ${date}`;
      }

      if (reminder.frequency && reminder.frequency !== "none") {
        const frequencyMap = {
          daily: "hàng ngày",
          weekly: "hàng tuần",
          monthly: "hàng tháng",
          yearly: "hàng năm",
        };
        context += ` (${frequencyMap[reminder.frequency] || reminder.frequency})`;
      }

      context += ` - Trạng thái: ${reminder.status === "done" ? "Đã hoàn thành" : "Chưa hoàn thành"}\n`;
    });

    return context;
  } catch (error) {
    console.error("Error fetching reminders context:", error);
    return "";
  }
};

/**
 * Get products context for AI prompt
 */
const getProductsContext = async () => {
  try {
    const products = await prisma.products.findMany({
      take: 50, // Limit to 50 products
      include: {
        vendor: {
          select: {
            store_name: true,
          },
        },
      },
    });

    if (products.length === 0) return "";

    let context = "\nSản phẩm có sẵn trong cửa hàng:\n";
    products.forEach((product) => {
      const priceInVND = parseFloat(product.price).toLocaleString("vi-VN");
      context += `- ${product.name} (${product.category || "Không phân loại"}): ${priceInVND} VND`;
      if (product.vendor?.store_name) {
        context += ` - Cửa hàng: ${product.vendor.store_name}`;
      }
      context += "\n";
    });

    return context;
  } catch (error) {
    console.error("Error fetching products context:", error);
    return "";
  }
};

/**
 * Get services context for AI prompt
 */
const getServicesContext = async () => {
  try {
    const services = await prisma.services.findMany({
      take: 30, // Limit to 30 services
      include: {
        vendor: {
          select: {
            store_name: true,
          },
        },
      },
    });

    if (services.length === 0) return "";

    let context = "\nDịch vụ có sẵn:\n";
    services.forEach((service) => {
      const priceInVND = parseFloat(service.price).toLocaleString("vi-VN");
      context += `- ${service.name} (${service.category || "Không phân loại"}): ${priceInVND} VND`;
      if (service.duration) {
        context += ` - Thời gian: ${service.duration} phút`;
      }
      if (service.vendor?.store_name) {
        context += ` - Cửa hàng: ${service.vendor.store_name}`;
      }
      context += "\n";
    });

    return context;
  } catch (error) {
    console.error("Error fetching services context:", error);
    return "";
  }
};

/**
 * Build comprehensive prompt for AI
 */
const buildPrompt = async (userMessage, userId, petId = null) => {
  const petContext = await getPetContext(petId);
  const remindersContext = await getRemindersContext(userId, petId);
  const productsContext = await getProductsContext();
  const servicesContext = await getServicesContext();

  const basePrompt = `Bạn là một trợ lý AI chuyên về chăm sóc thú cưng của ứng dụng PetCare+. Nhiệm vụ của bạn là:

1. Trả lời các câu hỏi về chăm sóc thú cưng bằng tiếng Việt
2. Đưa ra lời khuyên dựa trên thông tin thú cưng của người dùng (nếu có)
3. Đề xuất sản phẩm và dịch vụ phù hợp từ danh sách có sẵn
4. Nhắc nhở về các lời nhắc sắp tới của người dùng
5. Luôn trả lời một cách thân thiện, chuyên nghiệp và hữu ích

${petContext ? `\n${petContext}` : "\nNgười dùng chưa chọn thú cưng cụ thể, hãy trả lời chung chung."}
${remindersContext ? `\n${remindersContext}` : ""}
${productsContext ? `\n${productsContext}` : ""}
${servicesContext ? `\n${servicesContext}` : ""}

Lưu ý:
- Luôn sử dụng tiếng Việt
- Định dạng câu trả lời rõ ràng, có thể sử dụng dấu đầu dòng (*) và in đậm (**text**)
- Khi đề xuất sản phẩm/dịch vụ, hãy đề cập đến tên và giá cụ thể
- Nếu có lời nhắc sắp tới, hãy nhắc nhở người dùng

Câu hỏi của người dùng: ${userMessage}

Hãy trả lời một cách chi tiết và hữu ích:`;

  return basePrompt;
};

/**
 * Generate AI response using Gemini
 */
export const generateAIResponse = async (userMessage, userId, petId = null) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    const prompt = await buildPrompt(userMessage, userId, petId);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw error;
  }
};

