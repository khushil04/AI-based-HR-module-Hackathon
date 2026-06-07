import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ChatbotWidget from "./components/common/ChatbotWidget";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import "./index.css";

// Socket lives outside StrictMode so dev double-mount does not kill the WebSocket mid-handshake
ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <React.StrictMode>
          <App />
          <ChatbotWidget />
        </React.StrictMode>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>,
);
