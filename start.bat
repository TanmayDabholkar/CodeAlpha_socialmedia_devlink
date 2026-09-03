@echo off
title DevLink Platform - Universal Server
echo ========================================================
echo        DevLink Developer Social Network (v2.4)
echo ========================================================
echo.
echo Starting Universal Node.js Backend Server...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/ to run the backend.
    echo Opening static frontend in default browser instead...
    start "" "homepage\index.html"
    pause
    exit /b
)

node server\server.js
pause
