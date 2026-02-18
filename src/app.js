import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

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
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

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
