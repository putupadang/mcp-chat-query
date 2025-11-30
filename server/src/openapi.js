/**
 * OpenAPI 3.0 Specification for MCP Server
 */
module.exports = {
  openapi: "3.0.0",
  info: {
    title: "MCP (Model Context Protocol) Server API",
    version: "1.0.0",
    description:
      "A production-ready MCP server that exposes tools for LLM agents to interact with systems",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "API key for authentication",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
          details: { type: "object" },
        },
      },
      Tool: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          schema: { type: "object" },
          metadata: {
            type: "object",
            properties: {
              cost: { type: "string" },
              estimatedLatency: { type: "string" },
              requiredPermissions: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    "/tools": {
      get: {
        summary: "List all available tools",
        description:
          "Returns a list of all tools that can be invoked by the agent",
        tags: ["Tools"],
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    tools: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Tool" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/invoke": {
      post: {
        summary: "Invoke a tool",
        description: "Execute a specific tool with the provided input",
        tags: ["Tools"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tool: {
                    type: "string",
                    description: "Name of the tool to invoke",
                    example: "search_db",
                  },
                  input: {
                    type: "object",
                    description: "Input parameters for the tool",
                    example: { q: "laptop", limit: 5 },
                  },
                },
                required: ["tool"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Tool executed successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    tool: { type: "string" },
                    result: { type: "object" },
                    metadata: {
                      type: "object",
                      properties: {
                        executionTime: { type: "string" },
                        requestId: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request or validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          403: {
            description: "Forbidden - insufficient permissions",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          404: {
            description: "Tool not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/agent/ask": {
      post: {
        summary: "Ask the agent",
        description:
          "Send a message to the agent, which will decide whether to use tools",
        tags: ["Agent"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    description: "User message",
                    example: "search for laptops",
                  },
                },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Agent response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    response: { type: "string" },
                    toolUsed: { type: "boolean" },
                    toolName: { type: "string" },
                    toolInput: { type: "object" },
                    toolResult: { type: "object" },
                    reasoning: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/health": {
      get: {
        summary: "Health check",
        description: "Check server health status",
        tags: ["Admin"],
        responses: {
          200: {
            description: "Health status",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    status: { type: "string" },
                    uptime: { type: "number" },
                    timestamp: { type: "string" },
                    memory: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/audit": {
      get: {
        summary: "Get audit logs",
        description: "Retrieve audit logs of tool invocations",
        tags: ["Admin"],
        parameters: [
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 100 },
            description: "Maximum number of logs to return",
          },
        ],
        responses: {
          200: {
            description: "Audit logs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    logs: { type: "array", items: { type: "object" } },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Tools",
      description: "Tool registry and invocation endpoints",
    },
    {
      name: "Agent",
      description: "Agent interaction endpoints",
    },
    {
      name: "Admin",
      description: "Administrative endpoints",
    },
  ],
};
