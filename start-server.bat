@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Starting AutoHub server...

REM Free port 3000 if in use
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Stopping process on port 3000 ^(PID %%a^)
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

if not exist "app\dist\index.html" (
  echo Building React app...
  cd app
  call npm run build
  cd ..
  if not exist "app\dist\index.html" (
    echo Build failed. Check errors above.
    pause
    exit /b 1
  )
)

node app\server\index.mjs
pause
