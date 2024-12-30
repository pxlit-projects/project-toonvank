# Save the current location
$originalLocation = Get-Location

try {
    # Navigate to the backend directory and run Maven
    Set-Location -Path ".\backend-java\NewsManagementSystem"
    Write-Host "Building backend project..." -ForegroundColor Green
    mvn clean package -DskipTests

    # Check if Maven command was successful
    if ($LASTEXITCODE -ne 0) {
        throw "Maven build failed with exit code $LASTEXITCODE"
    }

    # Return to original directory
    Set-Location $originalLocation

    # Run docker-compose
    Write-Host "Starting Docker containers..." -ForegroundColor Green
    docker-compose up -d

    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose failed with exit code $LASTEXITCODE"
    }

    Write-Host "Setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
} finally {
    # Ensure we always return to the original directory
    Set-Location $originalLocation
}