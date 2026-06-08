# Local Development Guide

This guide provides instructions for developers who want to run or debug individual services locally without fully relying on Docker for everything.

## Running Services Locally

If you need to work on a specific service (e.g., `user-fastapi`), you can run the rest of the dependencies (like PostgreSQL) via Docker, and run your target service natively on your host machine.

### 1. Start the Database
You can start just the PostgreSQL container so your local services can connect to it:
```bash
docker-compose up -d postgres
```
This will also automatically run the database initialization script.

### 2. Run a FastAPI Service Locally
Make sure you have Python and `uv` installed.
Navigate to the service directory:
```bash
cd backend/user-fastapi
```
Sync dependencies:
```bash
uv sync
```
Start the service:
```bash
uv run uvicorn main:app --reload --port 8005
```

### 3. Run the Go API Gateway Locally
Navigate to the gateway directory:
```bash
cd backend/api-gateway
```
Start the gateway:
```bash
go run main.go
```
*Note: You may need to export environment variables like `USER_SERVICE_URL=http://localhost:8005` if you are running services on different ports.*

### 4. Run the React Frontend Locally
Navigate to the frontend directory:
```bash
cd frontend
```
Install dependencies and run:
```bash
npm install
npm run dev
```

## Adding New Dependencies
- For Python (FastAPI): `uv add <package>`
- For Go: `go get <package>`
- For Node (React): `npm install <package>`
