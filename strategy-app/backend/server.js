require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const initiativeRoutes = require("./routes/initiativeRoutes");
const okrRoutes = require("./routes/okrRoutes");
const auditRoutes = require("./routes/auditRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const { router: orgRoutes } = require("./routes/orgRoutes");
const { requireAuth } = require("./middleware/auth");
const { recordAudit } = require("./utils/audit");
const { assertJwtSecretConfigured, jwtSecret } = require("./utils/tokens");
const { ensureAnalyticsRunning, registerAnalyticsShutdown } = require("./utils/analyticsProcess");

assertJwtSecretConfigured();

const app = express();
const server = http.createServer(app);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

function orgRoom(orgId) {
  return `org:${orgId}`;
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const payload = jwt.verify(token, jwtSecret());
    if (!payload.orgId) {
      return next(new Error("Organization context required"));
    }
    socket.data.user = payload;
    socket.join(orgRoom(payload.orgId));
    return next();
  } catch (_error) {
    return next(new Error("Invalid or expired token"));
  }
});

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true
  })
);
app.use(cookieParser());
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
app.use("/api/okrs", okrRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/org", orgRoutes);

app.post("/api/strategy/update", requireAuth, async (req, res) => {
  const payload = req.body || {};
  const room = orgRoom(req.user.orgId);

  io.to(room).emit("strategy:updated", {
    timestamp: new Date().toISOString(),
    update: payload
  });

  await recordAudit({
    orgId: req.user.orgId,
    userId: req.user.userId,
    action: "strategy.updated",
    entityType: "Strategy",
    metadata: { updateType: payload.type || "unknown" }
  });

  res.status(200).json({ message: "Update shared", payload });
});

io.on("connection", (socket) => {
  const { orgId, name } = socket.data.user;
  console.log(`Socket connected: ${socket.id} (org ${orgId})`);
  socket.emit("strategy:welcome", { message: `Connected to strategy updates for ${name}` });
});

registerAnalyticsShutdown();

const port = Number(process.env.PORT || 5000);

async function startServer() {
  await ensureAnalyticsRunning();

  server.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error.message);
  process.exit(1);
});
