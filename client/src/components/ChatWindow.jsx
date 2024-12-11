import React, { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ChatContext } from "../context/ChatContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { app } from "../firebase";

const ChatWindow = ({ senderId, productId }) => {
  const firestore = getFirestore(app);
  const { messages, setMessages } = useContext(ChatContext);
  const [product, setProduct] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (productId) {
          const productRef = doc(firestore, "products", productId);
          const productSnap = await getDoc(productRef);
          const productData = productSnap.exists() ? productSnap.data() : null;
          setProduct(productData);

          // Welcome message
          const welcomeMessage = {
            senderId: "system",
            receiverId: senderId,
            productId,
            content: `👋 Hello! I'm your AI shopping assistant. I can help you with:
            \n• Product information
            \n• Price negotiations
            \n• Delivery details
            \n• Payment options
            \nWhat would you like to know about ${productData?.name}?`,
            timestamp: new Date().toISOString(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const userMessage = {
        senderId,
        receiverId: "system",
        productId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
      setIsTyping(true);

      try {
        const response = await fetch(
          "http://localhost:5000/api/openai/generate-action",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: newMessage,
              productDetails: product,
              context: messages.slice(-5), // Send last 5 messages for context
              senderId, // Include senderId
              productId, // Include productId
            }),
          }
        );
        const data = await response.json();

        // Simulate typing delay for more natural interaction
        setTimeout(() => {
          const botReply = {
            senderId: "system",
            receiverId: senderId,
            productId,
            content: data.message,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, botReply]);
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        console.error("Error sending message:", error);
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center text-lg font-bold p-4 bg-white shadow-sm">
        <button
          onClick={() => navigate(`/chat/${senderId}`)}
          className="mr-2 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg">AI Shopping Assistant</h2>
          {isTyping && (
            <p className="text-sm text-gray-500">Bot is typing...</p>
          )}
        </div>
      </div>

      {/* Product Details */}
      {product && (
        <div className="p-4 bg-white shadow-sm border-b">
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-gray-600">
            Price: ₹{(product.price / product.quantity) * 100} per 100kg
          </p>
          <p className="text-gray-600">
            Available: {product.quantity} {product.quantityName}
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 my-2 flex ${
              msg.senderId === senderId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs md:max-w-md ${
                msg.senderId === senderId
                  ? "bg-blue-500 text-white"
                  : "bg-white shadow-md text-gray-800"
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {format(new Date(msg.timestamp), "hh:mm a")}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white shadow-lg">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <textarea
            className="flex-1 p-3 border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
            rows="1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
