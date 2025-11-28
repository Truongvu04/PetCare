import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not set. AI chatbot will not work.");
}

let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Get pet context for prompt
async function getPetContext(petId, prisma) {
  if (!petId) return null;

  try {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      select: {
        name: true,
        species: true,
        breed: true,
        age: true,
        weight: true,
        vaccination: true,
        medical_history: true,
      },
    });

    if (!pet) return null;

    // Convert weight from lbs to kg (1 lb = 0.453592 kg)
    const weightInKg = pet.weight ? (parseFloat(pet.weight) * 0.453592).toFixed(2) : null;
    
    return {
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "Unknown",
      age: pet.age || "Unknown",
      weight: weightInKg ? `${weightInKg} kg` : "Unknown",
      vaccination: pet.vaccination || "Not specified",
      medical_history: pet.medical_history || "No medical history recorded",
    };
  } catch (err) {
    console.error("Error fetching pet context:", err);
    return null;
  }
}

// Get reminders context for prompt
async function getRemindersContext(userId, petId, prisma) {
  try {
    const where = {
      pet: {
        user_id: userId,
      },
      status: "pending",
    };

    if (petId) {
      where.pet_id = petId;
    }

    const reminders = await prisma.reminder.findMany({
      where,
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
      take: 20, // Limit to 20 upcoming reminders
    });

    return reminders;
  } catch (err) {
    console.error("Error fetching reminders context:", err);
    return [];
  }
}

// Get products context for prompt
async function getProductsContext(petSpecies, prisma) {
  try {
    const where = {};
    if (petSpecies) {
      where.category = {
        contains: petSpecies.toLowerCase(),
      };
    }

    const products = await prisma.products.findMany({
      where,
      include: {
        product_images: {
          where: {
            is_thumbnail: true,
          },
          take: 1,
        },
        vendors: {
          select: {
            store_name: true,
          },
        },
      },
      take: 20,
      orderBy: {
        created_at: "desc",
      },
    });

    return products;
  } catch (err) {
    console.error("Error fetching products context:", err);
    return [];
  }
}

// Get services context for prompt
async function getServicesContext(prisma) {
  try {
    const services = await prisma.services.findMany({
      include: {
        vendors: {
          select: {
            store_name: true,
          },
        },
      },
      take: 20,
      orderBy: {
        created_at: "desc",
      },
    });

    return services;
  } catch (err) {
    console.error("Error fetching services context:", err);
    return [];
  }
}

// Generate prompt with pet context, reminders, products, and services
function buildPrompt(userMessage, petContext, remindersContext, productsContext, servicesContext) {
  // Chuẩn bị thông tin reminders với format cụ thể
  const remindersText = remindersContext.length > 0
    ? "\n\nDanh sách Lời nhắc hiện có:\n" + remindersContext.map(reminder => {
        const reminderTypeMap = {
          vaccination: "Tiêm chủng",
          vet_visit: "Khám thú y",
          feeding: "Cho ăn",
          grooming: "Chải chuốt",
          medication: "Thuốc",
          other: "Khác"
        };
        const typeLabel = reminderTypeMap[reminder.type] || reminder.type;
        const petName = reminder.pet?.name || "Thú cưng";
        const dateStr = new Date(reminder.reminder_date).toLocaleDateString("vi-VN");
        
        let reminderInfo = `- Lời nhắc ${typeLabel} cho ${petName}:\n`;
        reminderInfo += `  - Ngày: ${dateStr}\n`;
        if (reminder.vaccination_type) {
          reminderInfo += `  - Loại vaccine: ${reminder.vaccination_type}\n`;
        }
        if (reminder.feeding_time) {
          const timeStr = new Date(reminder.feeding_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
          reminderInfo += `  - Giờ cho ăn: ${timeStr}\n`;
        }
        if (reminder.frequency && reminder.frequency !== "none") {
          const freqMap = {
            daily: "Hàng ngày",
            weekly: "Hàng tuần",
            monthly: "Hàng tháng",
            yearly: "Hàng năm"
          };
          reminderInfo += `  - Tần suất: ${freqMap[reminder.frequency] || reminder.frequency}\n`;
        }
        return reminderInfo;
      }).join("\n")
    : "\nHiện tại không có lời nhắc nào.";

  // Chuẩn bị thông tin sản phẩm với format cụ thể
  const productsText = productsContext.length > 0
    ? "\n\nDanh sách Sản phẩm hiện có:\n" + productsContext.map(product =>
        `- Sản phẩm ${product.name}:
         - Mã sản phẩm: ${product.product_id}
         - Giá: ${product.price?.toLocaleString('vi-VN')} VND
         - Danh mục: ${product.category || 'Không có'}
         - Mô tả: ${product.description || 'Không có mô tả'}
         - Cửa hàng: ${product.vendors?.store_name || 'Không có thông tin'}`
      ).join("\n")
    : "\nHiện tại không có sản phẩm nào.";

  // Chuẩn bị thông tin dịch vụ với format cụ thể
  const servicesText = servicesContext.length > 0
    ? "\n\nDanh sách Dịch vụ hiện có:\n" + servicesContext.map(service =>
        `- Dịch vụ ${service.name}:
         - Mã dịch vụ: ${service.service_id}
         - Giá: ${service.price?.toLocaleString('vi-VN')} VND
         - Thời lượng: ${service.duration || 'Không có'} phút
         - Mô tả: ${service.description || 'Không có mô tả'}
         - Nhà cung cấp: ${service.vendors?.store_name || 'Không có thông tin'}`
      ).join("\n")
    : "\nHiện tại không có dịch vụ nào.";

  // Chuẩn bị thông tin thú cưng
  const petContextText = petContext
    ? `\n\nThông tin thú cưng hiện tại:
- Tên: ${petContext.name}
- Loài: ${petContext.species}
- Giống: ${petContext.breed}
- Tuổi: ${petContext.age}
- Cân nặng: ${petContext.weight}
- Tình trạng tiêm chủng: ${petContext.vaccination}
- Lịch sử y tế: ${petContext.medical_history}`
    : "\nNgười dùng chưa chọn thú cưng cụ thể.";

  const systemPrompt = `Bạn là trợ lý chatbot của PetCare+, chuyên hỗ trợ thông tin về lời nhắc chăm sóc thú cưng, sản phẩm cho thú cưng và hướng dẫn chăm sóc thú cưng.

Quy tắc trả lời về LỜI NHẮC:

1. Khi người dùng hỏi về lời nhắc:
   - Nếu có lời nhắc trong danh sách: Liệt kê chi tiết các lời nhắc với ngày, loại và thông tin liên quan
   - Nếu không có: Trả lời "Xin lỗi, hiện tại bạn chưa có lời nhắc nào được thiết lập"

2. Khi hỏi về lời nhắc tiêm chủng:
   - Nếu có: Liệt kê các lời nhắc tiêm chủng với ngày và loại vaccine
   - Nếu không có: Trả lời "Xin lỗi, hiện tại không có lời nhắc tiêm chủng nào"

3. Khi hỏi về lời nhắc cho ăn:
   - Nếu có: Liệt kê các lời nhắc cho ăn với giờ và tần suất
   - Nếu không có: Trả lời "Xin lỗi, hiện tại không có lời nhắc cho ăn nào"

4. Khi hỏi về lời nhắc khám thú y:
   - Nếu có: Liệt kê các lời nhắc khám thú y với ngày
   - Nếu không có: Trả lời "Xin lỗi, hiện tại không có lời nhắc khám thú y nào"

Quy tắc trả lời về SẢN PHẨM:

1. Khi người dùng hỏi về sản phẩm:
   - Nếu có sản phẩm phù hợp trong danh sách: Liệt kê chi tiết các sản phẩm với giá, mô tả và cửa hàng
   - Nếu không có: Trả lời "Xin lỗi, hiện tại chúng tôi không có sản phẩm nào phù hợp với yêu cầu của bạn"

2. Khi hỏi về giá sản phẩm:
   - Nếu có sản phẩm trong tầm giá: Liệt kê các sản phẩm phù hợp với giá cụ thể
   - Nếu không có: Trả lời "Xin lỗi, hiện tại chúng tôi không có sản phẩm nào trong tầm giá [X] VND"

3. Khi hỏi về sản phẩm cho loài thú cưng cụ thể:
   - Nếu có: Liệt kê các sản phẩm phù hợp với loài đó
   - Nếu không có: Trả lời "Xin lỗi, hiện tại chúng tôi không có sản phẩm nào cho [loài thú cưng]"

Quy tắc trả lời về DỊCH VỤ:

1. Khi người dùng hỏi về dịch vụ:
   - Nếu có dịch vụ phù hợp: Liệt kê các dịch vụ với giá, thời lượng và nhà cung cấp
   - Nếu không có: Trả lời "Xin lỗi, hiện tại chúng tôi không có dịch vụ nào phù hợp"

2. Khi hỏi về giá dịch vụ:
   - Cung cấp thông tin giá cụ thể của dịch vụ được hỏi

3. Khi hỏi về dịch vụ chăm sóc thú cưng:
   - Liệt kê các dịch vụ có sẵn như grooming, khám thú y, training, etc.

Quy tắc trả lời về CHĂM SÓC SỨC KHỎE:

1. Khi người dùng hỏi về sức khỏe thú cưng:
   - Dựa vào thông tin thú cưng (nếu có) để đưa ra lời khuyên phù hợp
   - Luôn nhắc nhở tham khảo ý kiến bác sĩ thú y cho các vấn đề nghiêm trọng
   - Đưa ra lời khuyên về dinh dưỡng, tập thể dục, vệ sinh dựa trên loài và độ tuổi

2. Khi hỏi về tiêm chủng:
   - Cung cấp thông tin về lịch tiêm chủng phù hợp với loài và độ tuổi
   - Nhắc nhở về tầm quan trọng của việc tiêm chủng định kỳ
   - Tham khảo lời nhắc tiêm chủng trong danh sách nếu có

3. Khi hỏi về dinh dưỡng:
   - Đưa ra lời khuyên về thức ăn phù hợp với loài, độ tuổi và cân nặng
   - Đề xuất các sản phẩm thức ăn có sẵn trong danh sách nếu phù hợp

Quy tắc chung:

1. CHỈ trả lời các câu hỏi liên quan đến lời nhắc, sản phẩm, dịch vụ và chăm sóc thú cưng trong danh sách.

2. KHÔNG trả lời các chủ đề khác ngoài phạm vi pet care.

3. Trả lời ngắn gọn, súc tích và chuyên nghiệp bằng tiếng Việt.

4. Luôn đề xuất các sản phẩm/dịch vụ cụ thể từ danh sách nếu phù hợp với câu hỏi.

5. Khi người dùng hỏi chung chung, ưu tiên giới thiệu cả sản phẩm và dịch vụ phù hợp.

6. Nếu câu hỏi không rõ ràng, hãy hỏi lại để làm rõ yêu cầu về lời nhắc, sản phẩm, dịch vụ hay tư vấn chăm sóc.

7. Luôn nhấn mạnh tầm quan trọng của việc tham khảo bác sĩ thú y cho các vấn đề sức khỏe nghiêm trọng.

8. Khi có thông tin thú cưng cụ thể, sử dụng thông tin đó để đưa ra lời khuyên cá nhân hóa.

Dữ liệu hiện có:${petContextText}${remindersText}${productsText}${servicesText}

Câu hỏi của người dùng: ${userMessage}

Hãy trả lời một cách hữu ích và chuyên nghiệp:`;

  return systemPrompt;
}

// Generate AI response
export async function generateAIResponse(userMessage, petId = null, userId = null, prisma = null) {
  if (!genAI) {
    throw new Error("Gemini API is not configured. Please set GEMINI_API_KEY environment variable.");
  }

  try {
    // Get pet context if petId provided
    let petContext = null;
    let remindersContext = [];
    let productsContext = [];
    let servicesContext = [];

    if (petId && prisma) {
      petContext = await getPetContext(petId, prisma);
    }

    // Get reminders context if userId provided
    if (userId && prisma) {
      remindersContext = await getRemindersContext(userId, petId, prisma);
    }

    // Get products context based on pet species
    if (prisma) {
      const petSpecies = petContext?.species || null;
      productsContext = await getProductsContext(petSpecies, prisma);
    }

    // Always get services context
    if (prisma) {
      servicesContext = await getServicesContext(prisma);
    }

    // Build prompt with all context
    const prompt = buildPrompt(userMessage, petContext, remindersContext, productsContext, servicesContext);

    // Get model - using Gemini 2.5 Flash (latest stable version)
    // Supports: text, images, video, audio, PDF
    // Input: 1,048,576 tokens | Output: 65,536 tokens
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (err) {
    console.error("Error generating AI response:", err);
    throw new Error(`Failed to generate AI response: ${err.message}`);
  }
}

