const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const pinoHttp = require("pino-http");

const config = require("./config");
const logger = require("./config/logger");
const authMiddleware = require("./middleware/auth");
const { auditMiddleware } = require("./middleware/audit");
const toolsRouter = require("./routes/tools");
const agentRouter = require("./routes/agent");
const adminRouter = require("./routes/admin");
const openApiSpec = require("./openapi");

const app = express();

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP logging
app.use(pinoHttp({ logger }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: "rate_limit_exceeded",
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Audit logging
app.use(auditMiddleware);

// Health check (no auth required)
app.get("/", (req, res) => {
  res.json({
    name: "MCP Server",
    version: "1.0.0",
    status: "running",
    docs: "/api-docs",
  });
});

// Swagger API documentation (no auth for convenience)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "MCP Server API Documentation",
  })
);

// Serve OpenAPI JSON
app.get("/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

// Apply authentication to protected routes
app.use(authMiddleware);

// Mount routers
app.use("/", toolsRouter);
app.use("/", agentRouter);
app.use("/", adminRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "Endpoint not found",
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, _next) => {
  logger.error({ err, requestId: req.requestId }, "Unhandled error");

  res.status(err.status || 500).json({
    error: "internal_error",
    message:
      config.nodeEnv === "development" ? err.message : "An error occurred",
    requestId: req.requestId,
  });
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(
    {
      port: config.port,
      nodeEnv: config.nodeEnv,
    },
    `🚀 MCP Server running on http://localhost:${config.port}`
  );
  logger.info(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info({ signal }, "Received shutdown signal");

  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

module.exports = app; // Export for testing
