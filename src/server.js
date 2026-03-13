import "dotenv/config";
import http from "http";
import app from "./app.js";
import { envVars } from "./app/config/env.js";
import { connectRedis } from "./app/config/redis.config.js";
import prisma from "./app/prisma/client.js";
import { initSocket } from "./app/socket.js";

let server;

const PORT = envVars.PORT || 8001;

const startServer = async () => {
  try {
    console.log(`Environment: ${envVars.NODE_ENV}`);

    // 1️⃣ Connect Redis
    connectRedis();
    // console.log("Redis Connected Successfully 🚚✅");

    // 2️⃣ Create HTTP server
    server = http.createServer(app);

    // 3️⃣ Initialize Socket.io
    initSocket(server);
    console.log("Socket.io initialized 🔌✅");

    // 4️⃣ Run Database Seed
    try {
      const { execSync } = await import("child_process");
      console.log("🌱 Checking database seed...");
      execSync("node prisma/seed.js", { stdio: "inherit" });
    } catch (seedError) {
      console.error("⚠️ Seed skipped or failed (this is usually fine if DB is already seeded)");
    }

    // 5️⃣ Start server
    server.listen(PORT, () => {
      console.log(`Server running on port 😉🚲✅ ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start server
startServer();
