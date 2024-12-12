const OpenAI = require("openai");
const ChatBot = require("../models/ChatBot");

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateResponse = async (req, res) => {
  try {
    const { text, context, senderId } = req.body;

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

    // Create system message for generalized chat assistant
    const systemMessage = {
      role: "system",
      content: `You are a helpful and knowledgeable AI assistant. You can:

1. Answer questions on a variety of topics (science, technology, arts, etc.).
2. Provide explanations, examples, and suggestions when asked.
3. Assist with problem-solving and brainstorming.
4. Engage in casual and friendly conversations.

Guidelines:
- Stay professional, friendly, and concise.
- Avoid making up information. If unsure, acknowledge it honestly.
- Use emojis sparingly to make responses engaging.
- Keep responses under 150 words unless specifically asked to elaborate.
- Be adaptable to user tone and context.`,
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
