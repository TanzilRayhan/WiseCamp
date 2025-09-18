import React from "react";
import ReactDOM from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </AuthProvider>
  </React.StrictMode>
);
