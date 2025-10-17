const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const petRoutes = require("./routes/pets");

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // <--- cần dòng này cho form-data

// ✅ Cho phép truy cập ảnh đã upload
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/pets", petRoutes);

app.get("/", (req, res) => {
  res.send("PetCare+ Backend is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
