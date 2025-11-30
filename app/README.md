# MCP App

Next.js frontend for interacting with the MCP Server.

## Features

- 💬 Interactive chat interface
- 🎨 Modern UI with TailwindCSS
- 🔧 Real-time tool visualization
- 📱 Responsive design
- 🔒 Secure API key management
- ⚡ Server-side rendering
- 🎯 TypeScript support

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:4000
# MCP_API_KEY=your-api-key

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```bash
# Public (accessible in browser)
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:4000

# Private (server-side only)
MCP_API_KEY=your-api-key
```

## Project Structure

```
app/
├── api/
│   └── chat/
│       └── route.ts      # Chat API route
├── globals.css           # Global styles
├── layout.tsx            # Root layout
└── page.tsx              # Home page

components/
├── ui/                   # UI components
│   ├── button.tsx
│   └── card.tsx
├── ChatMessage.tsx       # Message component
├── ChatInput.tsx         # Input component
└── ToolCall.tsx          # Tool visualization

lib/
└── utils.ts              # Utility functions
```

## Components

### ChatMessage

Displays user and assistant messages with tool calls.

```tsx
<ChatMessage
  message={{
    id: "1",
    role: "assistant",
    content: "Found 5 products",
    timestamp: new Date(),
    toolCall: {
      /* ... */
    },
  }}
/>
```

### ChatInput

Input field for sending messages.

```tsx
<ChatInput onSend={(message) => console.log(message)} disabled={false} />
```

### ToolCall

Visualizes tool invocations with input/output.

```tsx
<ToolCall
  toolCall={{
    name: "search_db",
    input: { q: "laptop" },
    result: { hits: [] },
  }}
/>
```

## Styling

Uses TailwindCSS with custom design tokens:

```css
/* Custom colors */
--primary: 221.2 83.2% 53.3%;
--secondary: 210 40% 96.1%;
--accent: 210 40% 96.1%;
--muted: 210 40% 96.1%;
```

## API Routes

### POST /api/chat

Proxy to MCP server's `/agent/ask` endpoint.

**Request:**

```json
{
  "message": "search for laptops"
}
```

**Response:**

```json
{
  "success": true,
  "response": "I found 5 products",
  "toolUsed": true,
  "toolName": "search_db",
  "toolInput": {},
  "toolResult": {}
}
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Docker

```bash
# Build
docker build -t mcp-app .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_MCP_SERVER_URL=https://api.example.com \
  -e MCP_API_KEY=your-key \
  mcp-app
```

## Development

```bash
# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

## License

MIT
