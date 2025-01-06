#!/bin/bash

# Print colored output
green() {
    echo -e "\033[32m$1\033[0m"
}

red() {
    echo -e "\033[31m$1\033[0m"
}

# Store the original directory
ORIGINAL_DIR=$(pwd)

# Function to cleanup and return to original directory
cleanup() {
    cd "$ORIGINAL_DIR"
}

# Set up trap to ensure we return to original directory on script exit
trap cleanup EXIT

# Function to check command status
check_status() {
    if [ $? -ne 0 ]; then
        red "Error: $1 failed"
        exit 1
    fi
}

# Main script execution
main() {
    # Navigate to backend directory and run Maven
    green "Building backend project..."
    cd backend-java/NewsManagementSystem || exit 1
    mvn clean package -DskipTests
    check_status "Maven build"

    # Return to original directory
    cd "$ORIGINAL_DIR" || exit 1

    # Clean frontend
    docker rm -f front-end
    docker rmi $(docker images | grep 'frontend-web' | awk '{print $3}') 2>/dev/null || true
    docker builder prune -f

    # Run docker-compose
    green "Starting Docker containers..."
    docker compose down -v
    docker-compose up -d
    check_status "Docker Compose"

    green "Setup completed successfully!"
}

# Run main function
main