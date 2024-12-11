const OpenAI = require("openai");
const ChatBot = require("../models/ChatBot");

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateResponse = async (req, res) => {
  try {
    const { text, productDetails, context, senderId, productId } = req.body;

    console.log("senderId: ", senderId);
    console.log("productId: ", productId);

    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ error: "Message text is required and must be a string." });
    }

    // Prepare the conversation context
    const conversationHistory = (context || []).map((msg) => ({
      role: msg.senderId === "system" ? "assistant" : "user",
      content: msg.content,
    }));

    // Create system message with product context
    const systemMessage = {
      role: "system",
      content: `You are a helpful AI shopping assistant. You help customers with their shopping queries.
      
Current product details:
- Name: ${productDetails?.name || "N/A"}
- Price: ₹${
        productDetails?.price
          ? (productDetails.price / productDetails.quantity).toFixed(2)
          : "N/A"
      } per ${productDetails?.unit || "unit"}
- Available Quantity: ${productDetails?.quantity || "N/A"} ${
        productDetails?.quantityName || ""
      }

Your tasks:
1. Answer questions about the product.
2. Help with price negotiations (be firm but polite).
3. Explain delivery options and payment methods.
4. Provide relevant suggestions.
5. Keep responses concise and friendly.

Remember:
- Stay professional and helpful.
- Don't make up information.
- If unsure, ask for clarification.
- Use emojis occasionally to be friendly.
- Keep responses under 150 words.`,
    };

    // Prepare the complete message array
    const messages = [
      systemMessage,
      ...conversationHistory,
      { role: "user", content: text },
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    });

    const botResponse =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    // Save conversation to the database
    await ChatBot.create({
      senderId,
      userMessage: text,
      botResponse,
      productId,
      timestamp: new Date(),
    });

    return res.status(200).json({ message: botResponse });
  } catch (error) {
    console.error("Error generating response:", error);

    // Handle rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
        message:
          "I'm currently handling too many requests. Please try again in a moment. 🙏",
      });
    }

    return res.status(500).json({
      error: "Failed to generate response",
      message:
        "I apologize, but I'm having trouble processing your request. Could you please try again? 🤔",
    });
  }
};
