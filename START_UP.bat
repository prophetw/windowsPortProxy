@echo off
title Port Proxy App - Server Startup

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator privileges confirmed.
) else (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit /b
)

REM Navigate to the application directory
cd /D "%~dp0"

REM Start the Node.js server
echo Starting the server with Node.js...
node server.js

REM Keep the window open if there's an error
pause
