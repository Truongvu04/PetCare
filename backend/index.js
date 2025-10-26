const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const petRoutes = require("./routes/pets");
const reminderRoutes = require("./routes/reminders");

// ✅ THÊM DÒNG NÀY ĐỂ KÍCH HOẠT CRON JOB KHI SERVER KHỞI ĐỘNG
require('./scheduler/reminderJob');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/pets", petRoutes);
app.use("/api/reminders", reminderRoutes);

app.get("/", (req, res) => {
  res.send("PetCare+ Backend is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});