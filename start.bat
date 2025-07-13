@echo off
echo Starting Task Manager Application...
echo.

echo Checking if MongoDB is running...
sc query MongoDB 2>nul | findstr "RUNNING" >nul
if %errorlevel% == 0 (
    echo ✅ MongoDB is already running
) else (
    echo Starting MongoDB service...
    net start MongoDB 2>nul
    if %errorlevel% == 0 (
        echo ✅ MongoDB started successfully
    ) else (
        echo ⚠️  MongoDB service not found or failed to start
        echo Using default MongoDB connection...
    )
)

echo.
echo Starting Task Manager Server...
npm start

pause
