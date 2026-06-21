import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

import path from "path";
import express from "express";

async function startServer() {
  try {
    // Backend runs standalone, no frontend serving needed
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
