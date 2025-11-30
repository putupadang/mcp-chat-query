# Quick Start Guide

Get your MCP Portfolio up and running in 5 minutes!

## Prerequisites

- **Node.js 18+** installed ([Download](https://nodejs.org))
- **npm** or **yarn**
- **Git** installed
- A code editor (VS Code recommended)

## 🚀 Fast Setup (Automated)

### Option 1: Using Setup Script

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mcp-portfolio.git
cd mcp-portfolio

# Run setup script (Unix/macOS/Linux)
chmod +x setup.sh
./setup.sh

# Follow the on-screen instructions
```

### Option 2: Using Docker

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mcp-portfolio.git
cd mcp-portfolio

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the app
# Frontend: http://localhost:3000
# API: http://localhost:4000/api-docs
```

## 📝 Manual Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/mcp-portfolio.git
cd mcp-portfolio
```

### Step 2: Setup Server

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and set your API key
# APP_API_KEY=your-secret-key-here
nano .env  # or use your preferred editor
```

### Step 3: Setup Frontend

```bash
cd ../app

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:4000
# MCP_API_KEY=your-secret-key-here
nano .env.local
```

### Step 4: Start Services

**Terminal 1 - Server:**

```bash
cd server
npm run dev

# Server will start on http://localhost:4000
```

**Terminal 2 - Frontend:**

```bash
cd app
npm run dev

# App will start on http://localhost:3000
```

## ✅ Verify Installation

1. **Check Server**: http://localhost:4000/api-docs

   - You should see the Swagger UI

2. **Check Frontend**: http://localhost:3000

   - You should see the chat interface

3. **Test API** (using curl):

```bash
curl -H "x-api-key: your-api-key" \
  http://localhost:4000/tools
```

## 🎯 First Steps

### 1. Try Example Prompts

Open http://localhost:3000 and try:

- "search for laptop products"
- "create a ticket for login issue"
- "run a database query"

### 2. Explore API Documentation

Visit http://localhost:4000/api-docs to:

- See all available tools
- Try API requests
- View schemas and examples

### 3. Check Logs

```bash
# Server logs (shows all requests)
cd server
npm run dev

# Check health
curl -H "x-api-key: your-key" \
  http://localhost:4000/admin/health
```

## 🧪 Run Tests

```bash
cd server

# Run all tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5000 npm run dev
```

### API Key Issues

Make sure:

1. `.env` file exists in `server/` directory
2. `APP_API_KEY` is set in `.env`
3. Same key is used in `app/.env.local` as `MCP_API_KEY`

### Connection Refused

Check that:

1. Server is running on port 4000
2. `NEXT_PUBLIC_MCP_SERVER_URL` in app points to correct server
3. No firewall blocking connections

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Customize Tools**: Add your own tools in `server/src/tools/handlers/`
2. **Modify UI**: Edit components in `app/components/`
3. **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Contribute**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

## 🎓 Learning Resources

- **Architecture**: [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference**: [docs/API.md](API.md)
- **Deployment**: [docs/DEPLOYMENT.md](DEPLOYMENT.md)

## 💡 Common Tasks

### Add a New Tool

1. Create handler in `server/src/tools/handlers/my-tool.js`
2. Register in `server/src/tools/registry.js`
3. Add tests in `server/__tests__/my-tool.test.js`
4. Restart server

### Change API Key

```bash
# Generate new key
openssl rand -hex 32

# Update server/.env
APP_API_KEY=new-key-here

# Update app/.env.local
MCP_API_KEY=new-key-here

# Restart both services
```

### Enable Debug Logging

```bash
# In server/.env
LOG_LEVEL=debug

# Restart server
npm run dev
```

## 🆘 Get Help

- **Documentation**: Check `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/mcp-portfolio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/mcp-portfolio/discussions)

## ✨ Success!

You now have a fully functional MCP server and frontend! Try:

1. Sending messages in the chat
2. Watching tool calls execute
3. Checking audit logs at http://localhost:4000/admin/audit
4. Exploring the Swagger docs

**Happy coding!** 🎉
