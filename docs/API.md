# API Documentation

Complete API reference for the MCP Server.

## Base URL

```
Development: http://localhost:4000
Production: https://your-server-url.com
```

## Authentication

All protected endpoints require an API key in the header:

```http
x-api-key: your-api-key-here
```

## Endpoints

### GET /

Server information and status.

**Response:**

```json
{
  "name": "MCP Server",
  "version": "1.0.0",
  "status": "running",
  "docs": "/api-docs"
}
```

---

### GET /tools

List all available tools with their schemas and metadata.

**Headers:**

```http
x-api-key: your-api-key
```

**Response:**

```json
{
  "success": true,
  "tools": [
    {
      "name": "search_db",
      "description": "Search product database by keywords and filters",
      "schema": {
        "type": "object",
        "properties": {
          "q": { "type": "string", "minLength": 1 },
          "category": { "type": "string" },
          "limit": { "type": "integer", "minimum": 1, "maximum": 100 }
        },
        "required": ["q"]
      },
      "metadata": {
        "cost": "low",
        "estimatedLatency": "100ms",
        "requiredPermissions": ["admin", "user"]
      }
    }
  ],
  "count": 3
}
```

---

### POST /invoke

Invoke a specific tool with input parameters.

**Headers:**

```http
x-api-key: your-api-key
Content-Type: application/json
```

**Request Body:**

```json
{
  "tool": "search_db",
  "input": {
    "q": "laptop",
    "category": "Electronics",
    "limit": 5
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "tool": "search_db",
  "result": {
    "hits": [
      {
        "id": 1,
        "name": "Laptop Pro",
        "category": "Electronics",
        "price": 1299
      }
    ],
    "total": 1,
    "query": "laptop",
    "category": "Electronics"
  },
  "metadata": {
    "executionTime": "127ms",
    "requestId": "uuid-here"
  }
}
```

**Error Responses:**

_400 Bad Request - Missing tool name:_

```json
{
  "error": "bad_request",
  "message": "Tool name is required"
}
```

_400 Bad Request - Validation error:_

```json
{
  "error": "validation_error",
  "message": "Input validation failed",
  "details": [
    {
      "instancePath": "",
      "schemaPath": "#/required",
      "keyword": "required",
      "params": { "missingProperty": "q" },
      "message": "must have required property 'q'"
    }
  ]
}
```

_403 Forbidden:_

```json
{
  "error": "forbidden",
  "message": "Role 'user' not authorized to use tool 'run_query'"
}
```

_404 Not Found:_

```json
{
  "error": "not_found",
  "message": "Tool 'unknown_tool' not found"
}
```

_500 Internal Server Error:_

```json
{
  "error": "execution_error",
  "message": "Tool execution failed",
  "tool": "search_db",
  "requestId": "uuid-here"
}
```

---

### POST /agent/ask

Send a natural language message to the agent, which decides whether to use tools.

**Headers:**

```http
x-api-key: your-api-key
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "search for laptop products"
}
```

**Response:**

```json
{
  "success": true,
  "response": "I found 5 product(s): Laptop Pro ($1299), Wireless Mouse ($29)",
  "toolUsed": true,
  "toolName": "search_db",
  "toolInput": {
    "q": "laptop",
    "limit": 5
  },
  "toolResult": {
    "hits": [
      /* ... */
    ],
    "total": 5
  },
  "reasoning": "User wants to search products"
}
```

**No Tool Response:**

```json
{
  "success": true,
  "response": "I understand you said: \"hello\". How can I help you?",
  "toolUsed": false
}
```

---

### GET /admin/health

Health check endpoint for monitoring.

**Headers:**

```http
x-api-key: your-api-key
```

**Response:**

```json
{
  "success": true,
  "status": "healthy",
  "uptime": 12345.67,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  }
}
```

---

### GET /admin/audit

Retrieve audit logs of tool invocations.

**Headers:**

```http
x-api-key: your-api-key
```

**Query Parameters:**

- `limit` (optional): Maximum number of logs to return (default: 100)

**Request:**

```
GET /admin/audit?limit=10
```

**Response:**

```json
{
  "success": true,
  "logs": [
    {
      "id": "request-id-123",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "tool": "search_db",
      "input": { "q": "laptop", "limit": 5 },
      "success": true,
      "user": "admin",
      "ip": "192.168.1.1"
    }
  ],
  "count": 10
}
```

---

### GET /admin/tickets

Retrieve all support tickets.

**Headers:**

```http
x-api-key: your-api-key
```

**Response:**

```json
{
  "success": true,
  "tickets": [
    {
      "id": "TICK-1234567890",
      "title": "Login Issue",
      "body": "Cannot login to my account",
      "priority": "medium",
      "status": "open",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### GET /api-docs

Interactive Swagger UI documentation.

**No authentication required.**

Access via browser: `http://localhost:4000/api-docs`

---

### GET /openapi.json

OpenAPI 3.0 specification in JSON format.

**No authentication required.**

**Response:**

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "MCP (Model Context Protocol) Server API",
    "version": "1.0.0"
  },
  "paths": {
    /* ... */
  }
}
```

---

## Rate Limiting

**Default Limits:**

- 100 requests per minute per IP
- Returns 429 status when exceeded

**Response when rate limited:**

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests, please try again later."
}
```

**Headers included in response:**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640000000
```

---

## Error Codes

| Code | Description                                       |
| ---- | ------------------------------------------------- |
| 400  | Bad Request - Invalid input or missing parameters |
| 401  | Unauthorized - Missing or invalid API key         |
| 403  | Forbidden - Insufficient permissions              |
| 404  | Not Found - Resource doesn't exist                |
| 429  | Too Many Requests - Rate limit exceeded           |
| 500  | Internal Server Error - Server-side error         |

---

## Tools Reference

### search_db

Search the product database by keywords and filters.

**Input Schema:**

```json
{
  "q": "string (required, min: 1)",
  "category": "string (optional, enum: Electronics, Furniture, Stationery)",
  "limit": "integer (optional, min: 1, max: 100, default: 10)"
}
```

**Example:**

```bash
curl -X POST http://localhost:4000/invoke \
  -H "x-api-key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_db",
    "input": {
      "q": "laptop",
      "category": "Electronics",
      "limit": 5
    }
  }'
```

---

### create_ticket

Create a support ticket in the ticketing system.

**Input Schema:**

```json
{
  "title": "string (required, min: 5, max: 200)",
  "body": "string (required, min: 10)",
  "priority": "string (optional, enum: low, medium, high, urgent, default: medium)"
}
```

**Example:**

```bash
curl -X POST http://localhost:4000/invoke \
  -H "x-api-key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "create_ticket",
    "input": {
      "title": "Login Issue",
      "body": "I cannot login to my account. Getting error 500.",
      "priority": "high"
    }
  }'
```

---

### run_query

Execute a database query (admin only, read-only).

**Input Schema:**

```json
{
  "query": "string (required, min: 5)",
  "database": "string (optional, default: default)"
}
```

**Restrictions:**

- Admin role required
- Dangerous keywords blocked: DROP, DELETE, TRUNCATE, ALTER

**Example:**

```bash
curl -X POST http://localhost:4000/invoke \
  -H "x-api-key: dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "run_query",
    "input": {
      "query": "SELECT * FROM products LIMIT 5"
    }
  }'
```

---

## SDKs and Libraries

### JavaScript/Node.js

```javascript
const axios = require("axios");

const client = axios.create({
  baseURL: "http://localhost:4000",
  headers: { "x-api-key": "your-api-key" },
});

// List tools
const { data } = await client.get("/tools");

// Invoke tool
const result = await client.post("/invoke", {
  tool: "search_db",
  input: { q: "laptop", limit: 5 },
});
```

### Python

```python
import requests

class MCPClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {'x-api-key': api_key}

    def list_tools(self):
        response = requests.get(
            f'{self.base_url}/tools',
            headers=self.headers
        )
        return response.json()

    def invoke(self, tool, input_data):
        response = requests.post(
            f'{self.base_url}/invoke',
            json={'tool': tool, 'input': input_data},
            headers=self.headers
        )
        return response.json()

# Usage
client = MCPClient('http://localhost:4000', 'your-api-key')
result = client.invoke('search_db', {'q': 'laptop', 'limit': 5})
```

---

## WebSocket Support (Future)

WebSocket support is planned for real-time tool execution updates:

```javascript
const ws = new WebSocket("ws://localhost:4000/ws");

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "invoke",
      tool: "search_db",
      input: { q: "laptop" },
    })
  );
});

ws.on("message", (data) => {
  const result = JSON.parse(data);
  console.log("Tool result:", result);
});
```

---

## Postman Collection

Import the OpenAPI spec into Postman:

1. Open Postman
2. Import → Link
3. Enter: `http://localhost:4000/openapi.json`
4. Configure API key in collection variables
