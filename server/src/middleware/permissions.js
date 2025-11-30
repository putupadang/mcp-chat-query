/**
 * Role-based access control (RBAC) for tools
 */
const toolPermissions = {
  search_db: ["admin", "user"],
  create_ticket: ["admin", "user"],
  run_query: ["admin"],
  delete_data: ["admin"],
};

/**
 * Check if user has permission to use the tool
 */
const checkPermission = (toolName) => {
  return (req, res, next) => {
    const userRole = req.user?.role || "guest";
    const allowedRoles = toolPermissions[toolName] || [];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "forbidden",
        message: `Role '${userRole}' not authorized to use tool '${toolName}'`,
      });
    }

    next();
  };
};

module.exports = { checkPermission, toolPermissions };
