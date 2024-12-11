const mongoose = require("mongoose");

const chatbotSchema = new mongoose.Schema({
  senderId: { type: String },
  productId: { type: String },
  userMessage: {
    type: String,
    required: true,
  },
  botResponse: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatBot", chatbotSchema);
