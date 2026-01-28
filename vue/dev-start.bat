@echo off
echo ====================================
echo Monitoreo Infra - Development Setup
echo ====================================
echo.

echo [1/6] Starting API Gateway...
start "API Gateway" cmd /k "cd backend\api-gateway && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/6] Starting Systems Service...
start "Systems Service" cmd /k "cd backend\services\systems && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/6] Starting Metrics Service...
start "Metrics Service" cmd /k "cd backend\services\metrics && npm run dev"
timeout /t 3 /nobreak >nul

echo [4/6] Starting Logs Service...
start "Logs Service" cmd /k "cd backend\services\logs && npm run dev"
timeout /t 3 /nobreak >nul

echo [5/6] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ====================================
echo All services started!
echo ====================================
echo.
echo Services running on:
echo   Frontend:        http://localhost:3000
echo   API Gateway:     http://localhost:4000
echo   Systems Service: http://localhost:4001
echo   Metrics Service: http://localhost:4002
echo   Logs Service:    http://localhost:4003
echo.
echo Press Ctrl+C in each terminal to stop services
echo ====================================
pause
