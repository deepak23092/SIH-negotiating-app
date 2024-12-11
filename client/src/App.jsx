import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatWindow from "./components/ChatWindow";
import { ChatProvider } from "./context/ChatContext";
import React from "react";

// NegotiationPage Component
const NegotiationPage = () => {
  const { senderId, productId } = useParams();

  // Detect mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex justify-center items-center">
      {/* Single ChatWindow for negotiation */}
      <ChatWindow senderId={senderId} productId={productId} />
    </div>
  );
};

// App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Negotiation route */}
        <Route
          path="/chatbot/:senderId/:productId"
          element={
            <ChatProvider>
              <NegotiationPage />
            </ChatProvider>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
