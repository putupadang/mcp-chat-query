const express = require("express");
const { getAllTools, getTool } = require("../tools/registry");
const { validateSchema } = require("../validators/schema-validator");
const { checkPermission } = require("../middleware/permissions");
const logger = require("../config/logger");

const router = express.Router();

/**
 * GET /tools - List all available tools
 */
router.get("/tools", (req, res) => {
  try {
    const tools = getAllTools();
    res.json({
      success: true,
      tools,
      count: tools.length,
    });
  } catch (error) {
    logger.error({ error }, "Failed to list tools");
    res.status(500).json({
      error: "internal_error",
      message: "Failed to retrieve tools",
    });
  }
});

/**
 * POST /invoke - Invoke a tool
 */
router.post("/invoke", async (req, res) => {
  const { tool: toolName, input } = req.body;

  // Validate request body
  if (!toolName) {
    return res.status(400).json({
      error: "bad_request",
      message: "Tool name is required",
    });
  }

  // Get tool
  const tool = getTool(toolName);
  if (!tool) {
    return res.status(404).json({
      error: "not_found",
      message: `Tool '${toolName}' not found`,
    });
  }

  // Check permissions
  const userRole = req.user?.role || "guest";
  const allowedRoles = tool.metadata?.requiredPermissions || [];
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({
      error: "forbidden",
      message: `Role '${userRole}' not authorized to use tool '${toolName}'`,
    });
  }

  // Validate input against schema
  const validation = validateSchema(tool.schema, input || {});
  if (!validation.valid) {
    return res.status(400).json({
      error: "validation_error",
      message: "Input validation failed",
      details: validation.errors,
    });
  }

  // Execute tool
  try {
    const startTime = Date.now();
    const result = await tool.handler(input || {});
    const duration = Date.now() - startTime;

    logger.info(
      {
        tool: toolName,
        duration,
        requestId: req.requestId,
      },
      "Tool executed successfully"
    );

    res.json({
      success: true,
      tool: toolName,
      result,
      metadata: {
        executionTime: `${duration}ms`,
        requestId: req.requestId,
      },
    });
  } catch (error) {
    logger.error(
      {
        error,
        tool: toolName,
        requestId: req.requestId,
      },
      "Tool execution failed"
    );

    res.status(500).json({
      error: "execution_error",
      message: error.message || "Tool execution failed",
      tool: toolName,
      requestId: req.requestId,
    });
  }
});

module.exports = router;
