import logger from "./logger.js";

export const validateEnvironment = () => {
  const requiredEnvVars = [
    "DB_USER",
    "DB_HOST",
    "DB_NAME",
    "DB_PASS",
    "DB_PORT",
    "JWT_SECRET",
    "PORT",
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );

  if (missingEnvVars.length > 0) {
    logger.error({
      message: "Missing required environment variables",
      missing: missingEnvVars,
    });
    process.exit(1);
  }

  logger.info({
    message: "Environment variables validated",
    count: requiredEnvVars.length,
  });
};
