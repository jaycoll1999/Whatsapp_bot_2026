@echo off
title Sidography Photography - WhatsApp AI Bot
echo =======================================================
echo    Starting Sidography Photography WhatsApp AI Bot...
echo =======================================================
echo.
cd /d "%~dp0"

if not exist node_modules (
    echo Installing required packages...
    call npm install
)

echo Starting WhatsApp Bot service...
node bot.js
pause
