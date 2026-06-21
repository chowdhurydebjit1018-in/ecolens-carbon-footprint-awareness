import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";
import path from "path";

export const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: [
        "'self'", 
        "ws:", 
        "wss:", 
        "https://securetoken.googleapis.com", 
        "https://identitytoolkit.googleapis.com", 
        "https://firestore.googleapis.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(
  cors({
    origin: env.CLIENT_ORIGIN || "*",
  })
);

// Body parsing with safe size limit
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: {
    success: false,
    error: {
      code: "rate_limit_exceeded",
      message: "Too many requests from this IP, please try again after 15 minutes"
    }
  }
});
app.use("/api/", apiLimiter);

// Custom Request ID middleware
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15);
  next();
});

import healthRoutes from "./routes/health.routes";
import geminiRoutes from "./routes/gemini.routes";
import routesRoutes from "./routes/routes.routes";
import activitiesRoutes from "./routes/activities.routes";

app.use("/api/health", healthRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/activities", activitiesRoutes);

// Catch 404 for API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "not_found",
      message: "Endpoint not found"
    }
  });
});

// Centralized error handler
app.use(errorHandler);
