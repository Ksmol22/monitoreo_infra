#!/bin/bash

echo "===================================="
echo "Monitoreo Infra - Development Setup"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}[1/6]${NC} Starting API Gateway..."
cd backend/api-gateway && npm run dev &
sleep 2

echo -e "${BLUE}[2/6]${NC} Starting Systems Service..."
cd backend/services/systems && npm run dev &
sleep 2

echo -e "${BLUE}[3/6]${NC} Starting Metrics Service..."
cd backend/services/metrics && npm run dev &
sleep 2

echo -e "${BLUE}[4/6]${NC} Starting Logs Service..."
cd backend/services/logs && npm run dev &
sleep 2

echo -e "${BLUE}[5/6]${NC} Starting Frontend..."
cd frontend && npm run dev &
sleep 2

echo ""
echo "===================================="
echo -e "${GREEN}All services started!${NC}"
echo "===================================="
echo ""
echo "Services running on:"
echo "  Frontend:        http://localhost:3000"
echo "  API Gateway:     http://localhost:4000"
echo "  Systems Service: http://localhost:4001"
echo "  Metrics Service: http://localhost:4002"
echo "  Logs Service:    http://localhost:4003"
echo ""
echo "Press Ctrl+C to stop all services"
echo "===================================="

# Wait for all background processes
wait
