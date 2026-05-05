// require("dotenv").config();
// const app = require("../app");
// const connectDB = require("./config/db");

// const PORT = process.env.PORT || 5000;

// connectDB();

// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

require("dotenv").config();

console.log("🚀 App starting...");
console.log("ENV:", {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

const app = require("./app"); // ⚠️ MUST be correct path
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("⏳ Connecting DB...");
    await connectDB();

    console.log("✅ DB Connected");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup Error:", err);
    process.exit(1);
  }
})();
