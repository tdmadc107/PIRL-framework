@echo off
rem Starts the PIRL Hub dashboard: double-click this file or run it from a terminal.
rem Arguments are passed straight to dashboard.js, for example: dashboard.bat --interval 5 --no-intro
setlocal
title PIRL Hub

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found in PATH. Install Node.js and run this again.
  pause
  exit /b 1
)

node "%~dp0dashboard.js" %*
if errorlevel 1 pause
