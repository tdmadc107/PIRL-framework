@echo off
rem Khoi dong dashboard cua Hub PIRL: double-click file nay hoac chay tu terminal.
rem Tham so duoc chuyen thang cho dashboard.js, vi du: dashboard.bat --interval 5 --no-intro
setlocal
title PIRL Hub

where node >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay Node.js trong PATH. Cai Node.js roi chay lai.
  pause
  exit /b 1
)

node "%~dp0dashboard.js" %*
if errorlevel 1 pause
