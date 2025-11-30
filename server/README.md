# MCP Server

Express.js server implementing the Model Context Protocol (MCP).

## Features

- 🔧 Tool registry with dynamic discovery
- ✅ JSON Schema validation using AJV
- 🔐 API key authentication with RBAC
- 📝 Structured logging with Pino
- 📊 OpenAPI 3.0 documentation
- ⚡ Rate limiting
- 🔍 Audit logging
- 🧪 Comprehensive test suite

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# APP_API_KEY=your-secret-key

# Start development server
npm run dev

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

## Environment Variables

```bash
# Server
PORT=4000
NODE_ENV=development

# Security
APP_API_KEY=your-secret-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── index.js     # Main config
│   └── logger.js    # Logger setup
├── middleware/       # Express middleware
│   ├── auth.js      # Authentication
│   ├── permissions.js # RBAC
│   └── audit.js     # Audit logging
├── routes/           # API routes
│   ├── tools.js     # Tools endpoints
│   ├── agent.js     # Agent endpoints
│   └── admin.js     # Admin endpoints
├── tools/            # Tool implementation
│   ├── registry.js  # Tool registry
│   └── handlers/    # Tool handlers
├── validators/       # Schema validators
│   └── schema-validator.js
├── openapi.js        # OpenAPI spec
└── index.js          # Entry point
```

## API Endpoints

| Method | Endpoint        | Description    |
| ------ | --------------- | -------------- |
| GET    | `/tools`        | List all tools |
| POST   | `/invoke`       | Invoke a tool  |
| POST   | `/agent/ask`    | Agent endpoint |
| GET    | `/admin/health` | Health check   |
| GET    | `/admin/audit`  | Audit logs     |
| GET    | `/api-docs`     | Swagger UI     |

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test tools.test.js

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

## Docker

```bash
# Build image
docker build -t mcp-server .

# Run container
docker run -p 4000:4000 \
  -e APP_API_KEY=your-key \
  mcp-server

# Using docker-compose
docker-compose up mcp-server
```

## Adding New Tools

1. Create handler in `src/tools/handlers/`
2. Register in `src/tools/registry.js`
3. Add tests in `__tests__/`
4. Update documentation

Example:

```javascript
// src/tools/handlers/my-tool.js
const myToolHandler = async ({ input }) => {
  // Implementation
  return { result: "success" };
};

module.exports = myToolHandler;

// src/tools/registry.js
const myToolHandler = require("./handlers/my-tool");

const tools = {
  my_tool: {
    name: "my_tool",
    description: "Description",
    schema: {
      /* JSON Schema */
    },
    metadata: {
      cost: "low",
      estimatedLatency: "100ms",
      requiredPermissions: ["user"],
    },
    handler: myToolHandler,
  },
};
```

## License

MIT
