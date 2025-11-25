#!/bin/bash

# Quick Start Script for Development Environment
# This script sets up and starts the Doit application in development mode

set -e

echo "🚀 Starting Doit Application Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo -e "${RED}Error: Please run this script from the project root directory${NC}"
  exit 1
fi

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}Error: Node.js is not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check for npm
if ! command -v npm &>/dev/null; then
  echo -e "${RED}Error: npm is not installed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Check for PostgreSQL
if ! command -v psql &>/dev/null; then
  echo -e "${YELLOW}⚠ PostgreSQL client not found. Make sure PostgreSQL is installed and running.${NC}"
fi

# Setup Backend
echo ""
echo -e "${YELLOW}📦 Setting up Backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
  echo "Creating .env file from template..."
  cp .env.example .env
  echo -e "${YELLOW}⚠ Please update backend/.env with your database credentials${NC}"
fi

if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
else
  echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

cd ..

# Setup Frontend
echo ""
echo -e "${YELLOW}📦 Setting up Frontend...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
else
  echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

cd ..

# --- Database Prompt Section Removed ---

# Start the servers
echo ""
echo -e "${GREEN}🚀 Starting development servers...${NC}"
echo ""
echo "This will automatically clear ports 3000 (backend) and 5173 (frontend)."
echo "Backend will run on: http://localhost:3000"
echo "Frontend will run on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Run the main dev script from the root
# This automatically runs 'predev' (to kill ports)
# and 'dev' (using concurrently)
npm run dev
