import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import RedirectHandler from "./components/common/RedirectHandler";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { NotificationProvider } from "./auth/NotificationContext";
import { MessageProvider } from "./components/messages/MessageContext";
import "./styles/global.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <MessageProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <RedirectHandler />
            <App />
          </MessageProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
    }
  });
}
