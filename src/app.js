import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { envVars } from "./app/config/env.js";
import prisma from "../src/app/prisma/client.js";
import paymentRoutes from "./app/modules/payment/payment.route.js";
import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeler.js";
import { router } from "./app/router/index.js";
import "./app/config/passport.config.js";



const app = express();

// 
// Stripe Webhook (RAW BODY FIRST)
// 
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes,
);

// 
// Global middlewares
// 
const allowedOrigins = [
  envVars.FRONT_END_URL,
  "https://aminpass.com",
  "https://api.aminpass.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost")) {
        callback(null, true);
      } else {
        // Fallback to true to allow all origins as requested previously
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);

app.use(cookieParser());
app.use(express.json({ strict: true }));
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// JSON body parse error handler (needs to be before routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Invalid JSON payload",
      detail: err.message,
    });
  }
  next(err);
});

// 
// Prisma injection
// 
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// 
// Routes
// 
app.use("/api", router);

// Upload
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
