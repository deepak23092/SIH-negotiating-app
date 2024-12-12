import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import { useState, useEffect } from "react";
import ChatWindow from "./components/ChatWindow";
import React from "react";

// NegotiationPage Component
const NegotiationPage = () => {
  const { senderId } = useParams();

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
      <ChatWindow senderId={senderId} />
    </div>
  );
};

// App Component
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Negotiation route */}
        <Route path="/chatbot/:senderId" element={<NegotiationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
