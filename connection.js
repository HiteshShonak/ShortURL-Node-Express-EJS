const mongoose = require("mongoose");

async function connectToDatabase(url) {
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

module.exports = {connectToDatabase,};