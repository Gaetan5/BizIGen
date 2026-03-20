#!/bin/bash
# ============================================
# BizGen AI - Docker Stop Script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   BizGen AI - Docker Stop${NC}"
echo -e "${BLUE}============================================${NC}"

# Stop services
echo -e "${YELLOW}Stopping Docker services...${NC}"
docker-compose down

echo -e "${GREEN}Services stopped successfully!${NC}"
