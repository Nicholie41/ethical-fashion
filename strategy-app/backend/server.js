require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const initiativeRoutes = require("./routes/initiativeRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/strategy";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/initiatives", initiativeRoutes);

app.post("/api/strategy/update", (req, res) => {
  const payload = req.body || {};
  io.emit("strategy:updated", {
    timestamp: new Date().toISOString(),
    update: payload
  });
  res.status(200).json({ message: "Update shared", payload });
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.emit("strategy:welcome", { message: "Connected to strategy updates" });
});

const port = Number(process.env.PORT || 5000);
server.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
