import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./app/middleware/errorHandler.js";
import prisma from "./app/prisma/client.js";
import { router } from "./app/router/index.js";

dotenv.config();

const app = express();

// Attach prisma to app (optional but useful)
app.set("prisma", prisma);

// Global middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Attach prisma to request
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

// Error handler (always last)
app.use(errorHandler);

export default app;
