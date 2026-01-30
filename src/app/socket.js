import { Server } from "socket.io";

let io = null;

/**
 * Initialize socket.io
 * This should be called ONLY ONCE from server.js
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // adjust later if needed
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    /**
     * Join business room
     * Used for staff/customer notifications
     */
    socket.on("join:business", (businessId) => {
      if (!businessId) return;

      socket.join(`business:${businessId}`);
      console.log(`🏢 Socket ${socket.id} joined business:${businessId}`);
    });

    /**
     * Join customer room (future use)
     */
    socket.on("join:customer", (customerId) => {
      if (!customerId) return;

      socket.join(`customer:${customerId}`);
      console.log(`👤 Socket ${socket.id} joined customer:${customerId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  return io;
};

/**
 * Get socket.io instance anywhere in the app
 * (services, utils, etc.)
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
