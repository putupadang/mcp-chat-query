const express = require("express");
const { getAuditLogs } = require("../middleware/audit");
const { getTickets } = require("../tools/handlers/create-ticket");

const router = express.Router();

/**
 * GET /admin/audit - Get audit logs
 */
router.get("/admin/audit", (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const logs = getAuditLogs(limit);

  res.json({
    success: true,
    logs,
    count: logs.length,
  });
});

/**
 * GET /admin/tickets - Get all tickets
 */
router.get("/admin/tickets", async (req, res) => {
  const tickets = await getTickets();

  res.json({
    success: true,
    tickets,
    count: tickets.length,
  });
});

/**
 * GET /admin/health - Health check
 */
router.get("/admin/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

module.exports = router;
