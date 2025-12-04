import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../config/prisma.js";
import NodeCache from "node-cache";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model: Gemini 2.5 Flash (latest stable version)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Cache for products and services context (TTL: 5 minutes)
const contextCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry with exponential backoff
 */
const retryWithBackoff = async (fn, retries = MAX_RETRIES) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Only retry on 429 (rate limit) or 503 (service unavailable)
      const isRetryable = error.status === 429 || error.status === 503;
      
      if (!isRetryable || attempt === retries) {
        throw error;
      }

      // Exponential backoff: delay = INITIAL_RETRY_DELAY * 2^attempt
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, attempt),
        MAX_RETRY_DELAY
      );

      console.warn(
        `API request failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${delay}ms...`,
        error.message
      );

      await sleep(delay);
    }
  }
};

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
 * Get products context for AI prompt (with caching)
 * Optimized: Reduced to 20 products to save tokens
 */
const getProductsContext = async () => {
  const cacheKey = "products_context";
  
  // Check cache first
  const cached = contextCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const products = await prisma.products.findMany({
      take: 20, // Reduced from 50 to 20 to save tokens
      orderBy: {
        created_at: "desc", // Get latest products
      },
      include: {
        vendors: {
          select: {
            store_name: true,
          },
        },
      },
    });

    if (products.length === 0) {
      contextCache.set(cacheKey, "");
      return "";
    }

    // Group by category to reduce token usage
    const grouped = {};
    products.forEach((product) => {
      const category = product.category || "Khác";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        name: product.name,
        price: parseFloat(product.price),
        store: product.vendors?.store_name,
      });
    });

    let context = "\nSản phẩm có sẵn:\n";
    Object.keys(grouped).forEach((category) => {
      context += `${category}: `;
      const items = grouped[category]
        .slice(0, 5) // Max 5 items per category
        .map((p) => `${p.name} (${p.price.toLocaleString("vi-VN")}đ)`)
        .join(", ");
      context += items + "\n";
    });

    // Cache the result
    contextCache.set(cacheKey, context);
    return context;
  } catch (error) {
    console.error("Error fetching products context:", error);
    return "";
  }
};

/**
 * Get services context for AI prompt (with caching)
 * Optimized: Reduced to 15 services and compact format
 */
const getServicesContext = async () => {
  const cacheKey = "services_context";
  
  // Check cache first
  const cached = contextCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const services = await prisma.services.findMany({
      take: 15, // Reduced from 30 to 15 to save tokens
      orderBy: {
        created_at: "desc", // Get latest services
      },
      include: {
        vendors: {
          select: {
            store_name: true,
          },
        },
      },
    });

    if (services.length === 0) {
      contextCache.set(cacheKey, "");
      return "";
    }

    // Compact format to save tokens
    let context = "\nDịch vụ có sẵn:\n";
    services.forEach((service) => {
      const price = parseFloat(service.price).toLocaleString("vi-VN");
      context += `- ${service.name}: ${price}đ`;
      if (service.duration) {
        context += ` (${service.duration}ph)`;
      }
      context += "\n";
    });

    // Cache the result
    contextCache.set(cacheKey, context);
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
 * Generate AI response using Gemini with retry logic
 */
export const generateAIResponse = async (userMessage, userId, petId = null) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const prompt = await buildPrompt(userMessage, userId, petId);

  try {
    // Retry with exponential backoff for rate limit errors
    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      return await response.response.text();
    });

    return result;
  } catch (error) {
    console.error("Error generating AI response:", error);

    // Provide fallback message for rate limit errors
    if (error.status === 429) {
      throw new Error(
        "Xin lỗi, hệ thống AI đang quá tải. Vui lòng thử lại sau vài phút. " +
        "Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ."
      );
    }

    // Re-throw other errors
    throw error;
  }
};

/**
 * Clear context cache (useful for testing or manual cache invalidation)
 */
export const clearContextCache = () => {
  contextCache.flushAll();
  console.log("Context cache cleared");
};


