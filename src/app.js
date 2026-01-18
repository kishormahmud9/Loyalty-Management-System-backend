import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import prisma from "../src/app/prisma/client.js"; // ✅ ADD THIS
import { notFound } from "./app/middleware/notFound.js";
import { globalErrorHandler } from "./app/middleware/globalErrorHandeler.js";
import { router } from "./app/router/index.js";
import "./app/config/passport.config.js";

dotenv.config();

const app = express();

// Global middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// ✅ Prisma injection (VERY IMPORTANT)
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use("/api", router);

// Health check
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
