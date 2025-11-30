const config = require("../config");

/**
 * Simple API key authentication middleware
 * In production, use JWT or OAuth2
 */
const authMiddleware = (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({
      error: "unauthorized",
      message: "API key is required",
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(401).json({
      error: "unauthorized",
      message: "Invalid API key",
    });
  }

  // Store user info for later use (in real app, decode JWT)
  req.user = { role: "admin" }; // simplified for demo
  next();
};

module.exports = authMiddleware;
