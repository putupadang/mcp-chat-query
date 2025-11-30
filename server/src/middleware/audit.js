const { v4: uuidv4 } = require("uuid");
const logger = require("../config/logger");

// In-memory audit log (use database in production)
const auditLog = [];

/**
 * Audit logging middleware
 */
const auditMiddleware = (req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;

  // Log request
  logger.info(
    {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
    "Incoming request"
  );

  // Capture response
  const oldJson = res.json;
  res.json = function (data) {
    // Store audit entry
    if (req.path === "/invoke") {
      auditLog.push({
        id: requestId,
        timestamp: new Date().toISOString(),
        tool: req.body?.tool,
        input: req.body?.input,
        success: !data.error,
        user: req.user?.role || "unknown",
        ip: req.ip,
      });

      logger.info(
        {
          requestId,
          tool: req.body?.tool,
          success: !data.error,
        },
        "Tool invocation"
      );
    }

    return oldJson.call(this, data);
  };

  next();
};

/**
 * Get audit logs
 */
const getAuditLogs = (limit = 100) => {
  return auditLog.slice(-limit);
};

module.exports = { auditMiddleware, getAuditLogs };
