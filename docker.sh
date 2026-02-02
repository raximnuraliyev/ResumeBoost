#!/bin/bash

# ResumeBoost Docker Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║         ResumeBoost Docker Setup          ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_help() {
    echo -e "${GREEN}Usage:${NC} ./docker.sh [command]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  dev         Start development environment (with hot reload)"
    echo "  prod        Start production environment"
    echo "  build       Build production Docker image"
    echo "  down        Stop all containers"
    echo "  logs        Show logs from all containers"
    echo "  logs-app    Show logs from app container only"
    echo "  db-push     Push Prisma schema to database"
    echo "  db-migrate  Run Prisma migrations"
    echo "  db-studio   Open Prisma Studio"
    echo "  shell       Open shell in app container"
    echo "  clean       Remove all containers, volumes, and images"
    echo "  status      Show status of all containers"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./docker.sh dev       # Start development mode"
    echo "  ./docker.sh prod      # Start production mode"
    echo "  ./docker.sh logs-app  # View application logs"
}

check_env() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from .env.docker...${NC}"
        cp .env.docker .env
        echo -e "${GREEN}Created .env file. Please update it with your API keys.${NC}"
    fi
}

case "$1" in
    dev)
        print_banner
        check_env
        echo -e "${GREEN}Starting development environment...${NC}"
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    prod)
        print_banner
        check_env
        echo -e "${GREEN}Starting production environment...${NC}"
        docker-compose up -d --build
        echo ""
        echo -e "${GREEN}Services started!${NC}"
        echo -e "  App:     ${BLUE}http://localhost:3000${NC}"
        echo -e "  Adminer: ${BLUE}http://localhost:8080${NC}"
        echo ""
        echo -e "${YELLOW}Run './docker.sh db-push' to initialize the database${NC}"
        ;;
    build)
        print_banner
        echo -e "${GREEN}Building production image...${NC}"
        docker-compose build --no-cache
        ;;
    down)
        echo -e "${YELLOW}Stopping all containers...${NC}"
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        docker-compose down 2>/dev/null || true
        echo -e "${GREEN}All containers stopped.${NC}"
        ;;
    logs)
        docker-compose logs -f
        ;;
    logs-app)
        docker-compose logs -f app
        ;;
    db-push)
        echo -e "${GREEN}Pushing Prisma schema to database...${NC}"
        docker-compose exec app npx prisma db push
        ;;
    db-migrate)
        echo -e "${GREEN}Running Prisma migrations...${NC}"
        docker-compose exec app npx prisma migrate deploy
        ;;
    db-studio)
        echo -e "${GREEN}Opening Prisma Studio...${NC}"
        echo -e "${YELLOW}Note: Prisma Studio will be available at http://localhost:5555${NC}"
        docker-compose exec app npx prisma studio
        ;;
    shell)
        echo -e "${GREEN}Opening shell in app container...${NC}"
        docker-compose exec app sh
        ;;
    clean)
        echo -e "${RED}Warning: This will remove all containers, volumes, and images!${NC}"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose -f docker-compose.dev.yml down -v --rmi all 2>/dev/null || true
            docker-compose down -v --rmi all 2>/dev/null || true
            echo -e "${GREEN}Cleanup complete.${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    status)
        echo -e "${GREEN}Container Status:${NC}"
        docker-compose ps
        ;;
    *)
        print_banner
        print_help
        ;;
esac
