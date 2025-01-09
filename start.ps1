$frontendPath = ".\frontend-web"
$backendPath = ".\backend-java\NewsManagementSystem"

Write-Host "Starting deployment process..." -ForegroundColor Green

Write-Host "`nDeploying frontend..." -ForegroundColor Yellow
if (Test-Path -Path $frontendPath) {
    Set-Location -Path $frontendPath
    Write-Host "Stopping and removing frontend containers..."
    docker compose down -v
    Write-Host "Building and starting frontend containers..."
    docker compose up -d --build
    Set-Location ..
} else {
    Write-Host "Frontend directory not found at $frontendPath" -ForegroundColor Red
}

Write-Host "`nDeploying backend..." -ForegroundColor Yellow
if (Test-Path -Path $backendPath) {
    Set-Location -Path $backendPath
    Write-Host "Rebuilding backend..."
    mvn clean package -DskipTests
    Write-Host "Stopping and removing backend containers..."
    docker compose down -v
    Write-Host "Building and starting backend containers..."
    docker compose up -d --build
    Set-Location ..
} else {
    Write-Host "Backend directory not found at $backendPath" -ForegroundColor Red
}

Write-Host "`nDeployment process completed!" -ForegroundColor Green