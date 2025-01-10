I'll help you update the README with setup and running instructions. Here's a clear, organized version:



# Fullstack Java Project

## Anton Van Kimmenade (3AONC)

## Folder structure

- Readme.md
- _architecture_: this folder contains documentation regarding the architecture of your system.
- `docker-compose.yml` : to start the backend (starts all microservices)
- _backend-java_: contains microservices written in java
- _demo-artifacts_: contains images, files, etc that are useful for demo purposes.
- _frontend-web_: contains the Angular webclient

Each folder contains its own specific `.gitignore` file.  
**:warning: complete these files asap, so you don't litter your repository with binary build artifacts!**

## How to Setup and Run

### Quick Start
Run `./start.ps1` to start both frontend and backend services automatically.

### Manual Setup

#### Frontend (frontend-web)
1. Navigate to the frontend-web directory
2. Run `docker compose up -d --build`
3. The application will be available on port 2351

#### Backend (backend-java/NewsManagementSystem)
1. Navigate to the backend directory
2. Run `mvn clean package` to build the application
3. Run `docker compose up -d` to start the services

### Running Tests

#### Frontend Tests
- Run `ng test` for basic testing
- Add `--code-coverage` flag for coverage reporting

#### Backend Tests
- Run `docker run -d --name sonarqube -p 9000:9000 sonarqube:latest`
- Run `mvn clean verify sonar:sonar -Dsonar.projectKey=NewsManagementSystem -Dsonar.host.url=http://localhost:9000 -Dsonar.login=sqp_a4d264dec2c3bedf6fdf01d8f81b8d38e51d8334 -Dsonar.java.coveragePlugin=jacoco -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml` inside of `CMD` (not `powershell`)