#!/bin/bash

# MCP Portfolio Setup Script
# This script sets up the development environment

set -e

echo "🚀 MCP Portfolio Setup"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required (found: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"

# Check npm
echo "📦 Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) found${NC}"
echo ""

# Setup Server
echo "🔧 Setting up MCP Server..."
cd server

if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    # Generate random API key
    API_KEY=$(openssl rand -hex 32 2>/dev/null || echo "dev-key-$(date +%s)")
    sed -i.bak "s/your-secret-api-key-here/$API_KEY/" .env
    rm .env.bak 2>/dev/null || true
    echo -e "${GREEN}✓ API Key generated: $API_KEY${NC}"
else
    echo -e "${YELLOW}⚠ .env file already exists, skipping...${NC}"
fi

echo "📥 Installing server dependencies..."
npm install
echo -e "${GREEN}✓ Server dependencies installed${NC}"
echo ""

# Setup App
echo "🎨 Setting up Next.js App..."
cd ../app

if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    # Read API key from server .env
    SERVER_API_KEY=$(grep "APP_API_KEY" ../server/.env | cut -d'=' -f2)
    sed -i.bak "s/dev-key/$SERVER_API_KEY/" .env.local
    rm .env.local.bak 2>/dev/null || true
    echo -e "${GREEN}✓ Environment configured${NC}"
else
    echo -e "${YELLOW}⚠ .env.local file already exists, skipping...${NC}"
fi

echo "📥 Installing app dependencies..."
npm install
echo -e "${GREEN}✓ App dependencies installed${NC}"
echo ""

cd ..

# Summary
echo "✅ Setup complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Start the MCP Server:"
echo "   cd server && npm run dev"
echo ""
echo "2️⃣  Start the Next.js App (in a new terminal):"
echo "   cd app && npm run dev"
echo ""
echo "3️⃣  Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   API Docs:  http://localhost:4000/api-docs"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 Docker Alternative:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  docker-compose up -d"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
