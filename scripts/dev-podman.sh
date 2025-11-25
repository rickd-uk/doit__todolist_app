#!/bin/bash

# Development with Podman Containers
# This script manages the containerized development environment

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🐳 Starting Doit Development with Podman Containers..."

# Check if podman is installed
if ! command -v podman &>/dev/null; then
  echo -e "${RED}Error: Podman is not installed${NC}"
  echo "Install with: sudo apt install podman"
  exit 1
fi

if ! command -v podman-compose &>/dev/null; then
  echo -e "${RED}Error: Podman Compose is not installed${NC}"
  echo "Install with: pip3 install podman-compose"
  exit 1
fi

# Function to show menu
show_menu() {
  echo ""
  echo "Select an option:"
  echo "1) Start development containers"
  echo "2) Stop containers"
  echo "3) Restart containers"
  echo "4) View logs"
  echo "5) Rebuild containers"
  echo "6) Clean everything (remove volumes)"
  echo "7) Shell into backend"
  echo "8) Shell into frontend"
  echo "9) Database shell"
  echo "0) Exit"
  echo ""
}

# Start containers
start_containers() {
  echo -e "${GREEN}🚀 Starting containers...${NC}"
  podman-compose -f docker-compose.dev.yml up -d
  echo ""
  echo -e "${GREEN}✓ Containers started!${NC}"
  echo ""
  echo "Backend: http://localhost:3000"
  echo "Frontend: http://localhost:5173"
  echo "PostgreSQL: localhost:5432"
  echo ""
  echo "View logs: podman-compose -f docker-compose.dev.yml logs -f"
}

# Stop containers
stop_containers() {
  echo -e "${YELLOW}⏸️  Stopping containers...${NC}"
  podman-compose -f docker-compose.dev.yml down
  echo -e "${GREEN}✓ Containers stopped${NC}"
}

# Restart containers
restart_containers() {
  echo -e "${YELLOW}🔄 Restarting containers...${NC}"
  podman-compose -f docker-compose.dev.yml restart
  echo -e "${GREEN}✓ Containers restarted${NC}"
}

# View logs
view_logs() {
  echo "Which logs do you want to see?"
  echo "1) All"
  echo "2) Backend"
  echo "3) Frontend"
  echo "4) PostgreSQL"
  read -p "Choice: " log_choice

  case $log_choice in
  1) podman-compose -f docker-compose.dev.yml logs -f ;;
  2) podman-compose -f docker-compose.dev.yml logs -f backend ;;
  3) podman-compose -f docker-compose.dev.yml logs -f frontend ;;
  4) podman-compose -f docker-compose.dev.yml logs -f postgres ;;
  *) echo "Invalid choice" ;;
  esac
}

# Rebuild containers
rebuild_containers() {
  echo -e "${YELLOW}🔨 Rebuilding containers...${NC}"
  podman-compose -f docker-compose.dev.yml down
  podman-compose -f docker-compose.dev.yml build --no-cache
  podman-compose -f docker-compose.dev.yml up -d
  echo -e "${GREEN}✓ Containers rebuilt${NC}"
}

# Clean everything
clean_all() {
  echo -e "${RED}⚠️  This will remove all containers, images, and volumes!${NC}"
  read -p "Are you sure? (yes/no): " confirm

  if [ "$confirm" == "yes" ]; then
    podman-compose -f docker-compose.dev.yml down -v
    podman system prune -af
    echo -e "${GREEN}✓ Everything cleaned${NC}"
  else
    echo "Cancelled"
  fi
}

# Shell into backend
backend_shell() {
  podman exec -it doit-dev-backend /bin/sh
}

# Shell into frontend
frontend_shell() {
  podman exec -it doit-dev-frontend /bin/sh
}

# Database shell
db_shell() {
  podman exec -it doit-dev-postgres psql -U doit_user -d doit_db
}

# Main menu loop
while true; do
  show_menu
  read -p "Enter your choice: " choice

  case $choice in
  1) start_containers ;;
  2) stop_containers ;;
  3) restart_containers ;;
  4) view_logs ;;
  5) rebuild_containers ;;
  6) clean_all ;;
  7) backend_shell ;;
  8) frontend_shell ;;
  9) db_shell ;;
  0)
    echo "Goodbye!"
    exit 0
    ;;
  *) echo -e "${RED}Invalid choice${NC}" ;;
  esac
done
