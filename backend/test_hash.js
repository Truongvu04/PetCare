import bcrypt from "bcrypt";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const main = async () => {
  try {
    console.log("🧪 Test Hash Tool - Kiểm tra hash từ Python có tương thích với Node.js\n");
    
    const password = process.argv[2] || await prompt("Nhập mật khẩu gốc: ");
    const hashFromDB = process.argv[3] || await prompt("Nhập hash từ database: ");
    
    if (!password || !hashFromDB) {
      console.log("❌ Thiếu thông tin!");
      rl.close();
      return;
    }
    
    console.log("\n⏳ Đang kiểm tra...");
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hashFromDB.substring(0, 30)}...`);
    
    const isValid = await bcrypt.compare(password, hashFromDB.trim());
    
    console.log("\n" + "─".repeat(80));
    if (isValid) {
      console.log("✅ Hash KHỚP với mật khẩu!");
    } else {
      console.log("❌ Hash KHÔNG khớp với mật khẩu!");
      console.log("\n💡 Có thể do:");
      console.log("   1. Hash có khoảng trắng thừa (đầu/cuối)");
      console.log("   2. Hash không đầy đủ (thiếu ký tự)");
      console.log("   3. Mật khẩu nhập vào không đúng");
      console.log("   4. Hash được tạo bằng tool khác không tương thích");
    }
    console.log("─".repeat(80));
    
    console.log("\n🔍 Thông tin debug:");
    console.log(`   Hash length: ${hashFromDB.trim().length}`);
    console.log(`   Hash starts with: ${hashFromDB.trim().substring(0, 7)}`);
    console.log(`   Hash ends with: ${hashFromDB.trim().substring(hashFromDB.trim().length - 10)}`);
    
    console.log("\n🧪 Tạo hash mới từ mật khẩu này để so sánh:");
    const newHash = await bcrypt.hash(password, 10);
    console.log(newHash);
    
    rl.close();
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    rl.close();
    process.exit(1);
  }
};

main();

