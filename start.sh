#!/usr/bin/env bash
# ========================================================
# DevLink Developer Social Network (v2.4)
# macOS / Linux / WSL Universal Startup Script
# ========================================================

echo "========================================================"
echo "       DevLink Developer Social Network (v2.4)"
echo "========================================================"
echo ""

if ! command -v node &> /dev/null
then
    echo "[ERROR] Node.js is not found on your system PATH!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Opening static frontend in your default browser..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "homepage/index.html"
    elif command -v open &> /dev/null; then
        open "homepage/index.html"
    fi
    exit 1
fi

# Navigate to script directory if not already there
cd "$(dirname "$0")"

# Start Node server
node server/server.js
