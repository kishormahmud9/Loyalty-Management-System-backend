import { io } from "socket.io-client";

const BUSINESS_ID = "ba3f9690-00df-4b35-b153-5f9eaef136c9";

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to socket server:", socket.id);

  // join business room
  socket.emit("join:business", BUSINESS_ID);
  console.log("🏢 Joined business room:", BUSINESS_ID);
});

// listen for notification
socket.on("notification:new", (data) => {
  console.log("🔔 NEW NOTIFICATION RECEIVED:");
  console.log(data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from socket server");
});
