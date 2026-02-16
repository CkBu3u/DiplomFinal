@echo off
chcp 65001 >nul
cd /d "%~dp0"
title AutoHub — запуск сервера

echo.
echo ============================================
echo   AutoHub — локальный сервер
echo ============================================
echo.

REM Освобождаем порт 3000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Останавливаем процесс на порту 3000 (PID %%a)
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

if not exist "app\dist\index.html" (
  echo Сборка приложения...
  cd app
  call npm run build
  cd ..
  if not exist "app\dist\index.html" (
    echo Ошибка сборки.
    pause
    exit /b 1
  )
)

echo.
echo Запуск сервера на http://localhost:3000
echo.
echo Чтобы открыть сайт из интернета (с другого компьютера):
echo   1. Оставьте это окно открытым.
echo   2. Откройте ВТОРОЕ окно командной строки.
echo   3. Выполните:  ngrok http 3000
echo   4. Скопируйте ссылку https://....ngrok-free.app и отправьте её.
echo ============================================
echo.

node app\server\index.mjs
pause
