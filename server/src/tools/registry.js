const searchDbHandler = require("./handlers/search-db");
const { createTicketHandler } = require("./handlers/create-ticket");
const runQueryHandler = require("./handlers/run-query");
const ragQueryHandler = require("./handlers/rag-query");

/**
 * Tools registry with JSON Schema definitions
 */
const tools = {
  search_db: {
    name: "search_db",
    description: "Search product database by keywords and filters",
    schema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "Search query",
          minLength: 1,
        },
        category: {
          type: "string",
          description: "Filter by category",
          enum: ["Electronics", "Furniture", "Stationery"],
        },
        limit: {
          type: "integer",
          description: "Maximum number of results",
          minimum: 1,
          maximum: 100,
          default: 10,
        },
      },
      required: ["q"],
      additionalProperties: false,
    },
    metadata: {
      cost: "low",
      estimatedLatency: "100ms",
      requiredPermissions: ["admin", "user"],
    },
    handler: searchDbHandler,
  },

  create_ticket: {
    name: "create_ticket",
    description: "Create a support ticket in the ticketing system",
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "Ticket title",
          minLength: 5,
          maxLength: 200,
        },
        body: {
          type: "string",
          description: "Ticket description",
          minLength: 10,
        },
        priority: {
          type: "string",
          description: "Ticket priority level",
          enum: ["low", "medium", "high", "urgent"],
          default: "medium",
        },
      },
      required: ["title", "body"],
      additionalProperties: false,
    },
    metadata: {
      cost: "medium",
      estimatedLatency: "150ms",
      requiredPermissions: ["admin", "user"],
      requiresConfirmation: false,
    },
    handler: createTicketHandler,
  },

  run_query: {
    name: "run_query",
    description: "Execute a database query (admin only, read-only)",
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "SQL query to execute",
          minLength: 5,
        },
        database: {
          type: "string",
          description: "Target database",
          default: "default",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    metadata: {
      cost: "high",
      estimatedLatency: "200ms",
      requiredPermissions: ["admin"],
      requiresConfirmation: true,
    },
    handler: runQueryHandler,
  },

  rag_query: {
    name: "rag_query",
    description:
      "Retrieve relevant context chunks using embeddings (basic RAG)",
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "User query to retrieve relevant context",
          minLength: 3,
        },
        topK: {
          type: "integer",
          description: "Number of chunks to retrieve",
          minimum: 1,
          maximum: 10,
          default: 3,
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    metadata: {
      cost: "medium",
      estimatedLatency: "200ms",
      requiredPermissions: ["admin", "user"],
    },
    handler: ragQueryHandler,
  },
};

/**
 * Get all tools
 */
const getAllTools = () => {
  return Object.values(tools).map((tool) => ({
    name: tool.name,
    description: tool.description,
    schema: tool.schema,
    metadata: tool.metadata,
  }));
};

/**
 * Get a specific tool
 */
const getTool = (name) => {
  return tools[name];
};

module.exports = {
  tools,
  getAllTools,
  getTool,
};
