const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected ✅`);
  } catch (error) {
    console.error(`Database connection warning: ${error.message}`);
    console.log(`Note: Server is still running. Please ensure your MongoDB cluster is active and accessible.`);
  }
};

module.exports = connectDB;