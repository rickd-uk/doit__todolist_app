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

# Database setup instructions
echo ""
echo -e "${YELLOW}📊 Database Setup${NC}"
echo "Please ensure PostgreSQL is running and create the database:"
echo ""
echo "  sudo -i -u postgres psql"
echo "  CREATE USER todolist_user WITH PASSWORD 'your_password';"
echo "  CREATE DATABASE todolist_db OWNER todolist_user;"
echo "  GRANT ALL PRIVILEGES ON DATABASE todolist_db TO todolist_user;"
echo "  \q"
echo ""

# Ask if user wants to start the servers
read -p "Do you want to start the development servers now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${GREEN}🚀 Starting development servers...${NC}"
  echo ""
  echo "Backend will run on: http://localhost:3000"
  echo "Frontend will run on: http://localhost:5173"
  echo ""
  echo "Press Ctrl+C to stop both servers"
  echo ""

  # Start backend in background
  cd backend
  npm run dev &
  BACKEND_PID=$!
  cd ..

  # Wait a bit for backend to start
  sleep 3

  # Start frontend in background
  cd frontend
  npm run dev &
  FRONTEND_PID=$!
  cd ..

  # Trap Ctrl+C to kill both processes
  trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

  # Wait for both processes
  wait
else
  echo ""
  echo -e "${GREEN}✅ Setup complete!${NC}"
  echo ""
  echo "To start the development servers manually:"
  echo ""
  echo "Terminal 1 (Backend):"
  echo "  cd backend"
  echo "  npm run dev"
  echo ""
  echo "Terminal 2 (Frontend):"
  echo "  cd frontend"
  echo "  npm run dev"
  echo ""
fi
