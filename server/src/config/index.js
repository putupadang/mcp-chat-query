require("dotenv").config();

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  apiKey: process.env.APP_API_KEY || "dev-key",
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
  cors: {
    origins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(
      ","
    ),
  },
  logLevel: process.env.LOG_LEVEL || "info",
};
