// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./output.css"; // ✅ Import the compiled Tailwind CSS here

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
