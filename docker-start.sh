#!/bin/bash
# ============================================
# BizGen AI - Docker Startup Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   BizGen AI - Docker Startup${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from template...${NC}"
    cp .env.docker.example .env
    echo -e "${YELLOW}Please edit .env with your configuration${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: docker-compose is not installed${NC}"
    exit 1
fi

# Parse arguments
PROFILE=""
SERVICES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --production|-p)
            PROFILE="--profile production"
            shift
            ;;
        --monitoring|-m)
            PROFILE="--profile monitoring"
            shift
            ;;
        --all|-a)
            PROFILE="--profile production --profile monitoring"
            shift
            ;;
        --build|-b)
            SERVICES="--build"
            shift
            ;;
        --detached|-d)
            SERVICES="$SERVICES -d"
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--production|-p] [--monitoring|-m] [--all|-a] [--build|-b] [--detached|-d]"
            exit 1
            ;;
    esac
done

# Start services
echo -e "${GREEN}Starting Docker services...${NC}"
docker-compose up $SERVICES $PROFILE

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Services started successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
