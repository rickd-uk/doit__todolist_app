#!/bin/bash

# Production Podman Management Script
# Manages the production deployment with Podman containers

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 Doit Production Management"

# Check if podman is installed
if ! command -v podman &>/dev/null; then
  echo -e "${RED}Error: Podman is not installed${NC}"
  exit 1
fi

if ! command -v podman-compose &>/dev/null; then
  echo -e "${RED}Error: Podman Compose is not installed${NC}"
  exit 1
fi

# Function to show menu
show_menu() {
  echo ""
  echo "Select an option:"
  echo "1) Start production containers"
  echo "2) Stop containers"
  echo "3) Restart containers"
  echo "4) View logs"
  echo "5) Rebuild and restart (after git pull)"
  echo "6) Database shell"
  echo "7) Backend shell"
  echo "8) View container status"
  echo "9) Full rebuild (clean + build + start)"
  echo "0) Exit"
  echo ""
}

# Start containers
start_containers() {
  echo -e "${GREEN}🚀 Starting production containers...${NC}"
  podman-compose -f deployment/docker-compose.yml up -d
  echo ""
  echo -e "${GREEN}✓ Containers started!${NC}"
  echo ""
  echo "Application: https://doit.futureisnear.dev"
  echo ""
}

# Stop containers
stop_containers() {
  echo -e "${YELLOW}⏸️  Stopping containers...${NC}"
  podman-compose -f deployment/docker-compose.yml down
  echo -e "${GREEN}✓ Containers stopped${NC}"
}

# Restart containers
restart_containers() {
  echo -e "${YELLOW}🔄 Restarting containers...${NC}"
  podman-compose -f deployment/docker-compose.yml restart
  echo -e "${GREEN}✓ Containers restarted${NC}"
}

# View logs
view_logs() {
  echo "Which logs do you want to see?"
  echo "1) All"
  echo "2) Backend"
  echo "3) Frontend"
  echo "4) PostgreSQL"
  echo "5) Nginx"
  read -p "Choice: " log_choice

  case $log_choice in
  1) podman-compose -f deployment/docker-compose.yml logs -f ;;
  2) podman-compose -f deployment/docker-compose.yml logs -f backend ;;
  3) podman-compose -f deployment/docker-compose.yml logs -f frontend ;;
  4) podman-compose -f deployment/docker-compose.yml logs -f postgres ;;
  5) podman-compose -f deployment/docker-compose.yml logs -f nginx-proxy ;;
  *) echo "Invalid choice" ;;
  esac
}

# Rebuild and restart (use after git pull)
rebuild_restart() {
  echo -e "${YELLOW}🔨 Rebuilding containers...${NC}"

  # Stop containers
  podman-compose -f deployment/docker-compose.yml down

  # Rebuild images
  podman-compose -f deployment/docker-compose.yml build --no-cache backend frontend

  # Start containers
  podman-compose -f deployment/docker-compose.yml up -d

  echo -e "${GREEN}✓ Rebuild complete and containers started${NC}"
}

# Database shell
db_shell() {
  podman exec -it todolist-postgres psql -U doit_user -d doit_db
}

# Backend shell
backend_shell() {
  podman exec -it todolist-backend /bin/sh
}

# View container status
container_status() {
  echo -e "${GREEN}📊 Container Status:${NC}"
  podman ps --filter "name=todolist"
}

# Full rebuild (nuclear option)
full_rebuild() {
  echo -e "${RED}⚠️  This will rebuild everything from scratch!${NC}"
  read -p "Are you sure? (yes/no): " confirm

  if [ "$confirm" == "yes" ]; then
    echo -e "${YELLOW}🔨 Full rebuild starting...${NC}"

    # Stop and remove containers
    podman-compose -f deployment/docker-compose.yml down

    # Remove old images
    podman rmi -f todolist-backend todolist-frontend 2>/dev/null || true

    # Rebuild everything
    podman-compose -f deployment/docker-compose.yml build --no-cache

    # Start containers
    podman-compose -f deployment/docker-compose.yml up -d

    echo -e "${GREEN}✓ Full rebuild complete${NC}"
  else
    echo "Cancelled"
  fi
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
  5) rebuild_restart ;;
  6) db_shell ;;
  7) backend_shell ;;
  8) container_status ;;
  9) full_rebuild ;;
  0)
    echo "Goodbye!"
    exit 0
    ;;
  *) echo -e "${RED}Invalid choice${NC}" ;;
  esac
done
