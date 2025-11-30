const express = require("express");
const { getTool } = require("../tools/registry");
const { validateSchema } = require("../validators/schema-validator");
const logger = require("../config/logger");

const router = express.Router();

/**
 * Simple LLM agent simulator
 * In production, this would integrate with OpenAI, Anthropic, or local LLM
 */
const decideToolUsage = (message) => {
  const lowerMessage = message.toLowerCase();

  // Simple heuristic-based tool selection
  if (
    lowerMessage.includes("search") ||
    lowerMessage.includes("find") ||
    lowerMessage.includes("product")
  ) {
    return {
      shouldUseTool: true,
      tool: "search_db",
      input: {
        q: message.split(" ").slice(1).join(" ") || "laptop",
        limit: 5,
      },
      reasoning: "User wants to search products",
    };
  }

  if (
    lowerMessage.includes("ticket") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("problem")
  ) {
    return {
      shouldUseTool: true,
      tool: "create_ticket",
      input: {
        title: message.substring(0, 100),
        body: message,
        priority: "medium",
      },
      reasoning: "User wants to create a support ticket",
    };
  }

  if (lowerMessage.includes("query") || lowerMessage.includes("database")) {
    return {
      shouldUseTool: true,
      tool: "run_query",
      input: {
        query: "SELECT * FROM products LIMIT 5",
      },
      reasoning: "User wants to query database",
    };
  }

  return {
    shouldUseTool: false,
    reasoning: "No tool needed, general conversation",
  };
};

/**
 * POST /agent/ask - Agent endpoint
 */
router.post("/agent/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "bad_request",
      message: "Message is required",
    });
  }

  try {
    // Decide if tool usage is needed
    const decision = decideToolUsage(message);

    if (!decision.shouldUseTool) {
      // Direct response without tool
      return res.json({
        success: true,
        response: `I understand you said: "${message}". How can I help you? You can ask me to search products, create tickets, or query the database.`,
        toolUsed: false,
      });
    }

    // Get and execute tool
    const tool = getTool(decision.tool);
    if (!tool) {
      return res.status(404).json({
        error: "not_found",
        message: `Tool '${decision.tool}' not found`,
      });
    }

    // Validate input
    const validation = validateSchema(tool.schema, decision.input);
    if (!validation.valid) {
      return res.status(400).json({
        error: "validation_error",
        message: "Tool input validation failed",
        details: validation.errors,
      });
    }

    // Execute tool
    const toolResult = await tool.handler(decision.input);

    // Generate natural language response
    let response = "";
    if (decision.tool === "search_db") {
      const hits = toolResult.hits || [];
      response =
        `I found ${hits.length} product(s): ` +
        hits.map((h) => `${h.name} ($${h.price})`).join(", ");
    } else if (decision.tool === "create_ticket") {
      response = `I've created ticket ${toolResult.ticket.id} with title "${toolResult.ticket.title}". Our team will review it shortly.`;
    } else if (decision.tool === "run_query") {
      response = `Query executed successfully. Found ${toolResult.rowCount} rows.`;
    }

    res.json({
      success: true,
      response,
      toolUsed: true,
      toolName: decision.tool,
      toolInput: decision.input,
      toolResult,
      reasoning: decision.reasoning,
    });
  } catch (error) {
    logger.error({ error }, "Agent execution failed");
    res.status(500).json({
      error: "execution_error",
      message: error.message || "Agent failed to process request",
    });
  }
});

module.exports = router;
