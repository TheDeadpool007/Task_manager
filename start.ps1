Write-Host "🚀 Starting Task Manager Application..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB is already running" -ForegroundColor Green
    } else {
        Write-Host "🔄 Starting MongoDB service..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
        if ($?) {
            Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Failed to start MongoDB service" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠️  MongoDB service not found - using default connection" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting Task Manager Server on port 3002..." -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""

# Start the Node.js server
npm start
