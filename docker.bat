@echo off
setlocal enabledelayedexpansion

REM ResumeBoost Docker Helper Script for Windows

echo.
echo ╔═══════════════════════════════════════════╗
echo ║         ResumeBoost Docker Setup          ║
echo ╚═══════════════════════════════════════════╝
echo.

if "%1"=="" goto help
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="build" goto build
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="logs-app" goto logs-app
if "%1"=="db-push" goto db-push
if "%1"=="db-migrate" goto db-migrate
if "%1"=="shell" goto shell
if "%1"=="clean" goto clean
if "%1"=="status" goto status
goto help

:check_env
if not exist .env (
    echo Warning: .env file not found. Creating from .env.docker...
    copy .env.docker .env >nul
    echo Created .env file. Please update it with your API keys.
)
exit /b 0

:dev
call :check_env
echo Starting development environment...
docker-compose -f docker-compose.dev.yml up --build
goto end

:prod
call :check_env
echo Starting production environment...
docker-compose up -d --build
echo.
echo Services started!
echo   App:     http://localhost:3000
echo   Adminer: http://localhost:8080
echo.
echo Run 'docker.bat db-push' to initialize the database
goto end

:build
echo Building production image...
docker-compose build --no-cache
goto end

:down
echo Stopping all containers...
docker-compose -f docker-compose.dev.yml down 2>nul
docker-compose down 2>nul
echo All containers stopped.
goto end

:logs
docker-compose logs -f
goto end

:logs-app
docker-compose logs -f app
goto end

:db-push
echo Pushing Prisma schema to database...
docker-compose exec app npx prisma db push
goto end

:db-migrate
echo Running Prisma migrations...
docker-compose exec app npx prisma migrate deploy
goto end

:shell
echo Opening shell in app container...
docker-compose exec app sh
goto end

:clean
echo Warning: This will remove all containers, volumes, and images!
set /p confirm="Are you sure? (y/N) "
if /i "%confirm%"=="y" (
    docker-compose -f docker-compose.dev.yml down -v --rmi all 2>nul
    docker-compose down -v --rmi all 2>nul
    echo Cleanup complete.
) else (
    echo Cancelled.
)
goto end

:status
echo Container Status:
docker-compose ps
goto end

:help
echo Usage: docker.bat [command]
echo.
echo Commands:
echo   dev         Start development environment (with hot reload)
echo   prod        Start production environment
echo   build       Build production Docker image
echo   down        Stop all containers
echo   logs        Show logs from all containers
echo   logs-app    Show logs from app container only
echo   db-push     Push Prisma schema to database
echo   db-migrate  Run Prisma migrations
echo   shell       Open shell in app container
echo   clean       Remove all containers, volumes, and images
echo   status      Show status of all containers
echo.
echo Examples:
echo   docker.bat dev       # Start development mode
echo   docker.bat prod      # Start production mode
echo   docker.bat logs-app  # View application logs
goto end

:end
endlocal
