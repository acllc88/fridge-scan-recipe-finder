import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthModalProvider } from "./contexts/AuthModalContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthModalProvider>
      <App />
    </AuthModalProvider>
  </StrictMode>
);
