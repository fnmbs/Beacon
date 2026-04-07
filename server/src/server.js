import app from "./app.js";
import dotenv from "dotenv";
import initAuthDb from "./scripts/initAuthDb.js";
import logger from "./utils/logger.js";
import { validateEnvironment } from "./utils/validateEnv.js";

dotenv.config();

// Validate environment variables
validateEnvironment();

const PORT = process.env.PORT || 5000;

// Initialize auth database
// initAuthDb().catch((err) => {
//   logger.error({
//     message: "Failed to initialize auth database",
//     error: err.message,
//   });
//   process.exit(1);
// });

const server = app.listen(PORT, () => {
  logger.info({
    message: "Server started successfully",
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info("Graceful shutdown initiated...");

  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown due to timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error({
    message: "Uncaught Exception",
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error({
    message: "Unhandled Rejection",
    reason: reason,
    promise: promise,
  });
});
