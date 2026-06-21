import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

import path from "path";
import express from "express";

async function startServer() {
  try {
    // Static Asset Serving in Production
    if (env.NODE_ENV === "production") {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

startServer();
