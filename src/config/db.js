const mongoose = require("mongoose");

let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if available (for Lambda)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = connection;
    console.log("✅ MongoDB Connected");
    return connection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // Don't exit process in Lambda - throw error instead
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
