# Docker Setup Guide

This guide explains how to start the entire ecommerce microservices project using Docker.

## Prerequisites
- Docker
- Docker Compose

## Getting Started

1. **Environment Variables**: The project comes with a `.env.example` file. To run the project locally, the default values are sufficient, but you can copy it to `.env` if you need to override them:
   ```bash
   cp .env.example .env
   ```

2. **Start the Application**: To build the images, create the network, initialize the databases, and start all services, run exactly this command:
   ```bash
   docker-compose up -d --build
   ```
   *The `-d` flag runs it in detached mode so your terminal is not blocked.*
   *The `--build` flag ensures that any new code changes are compiled into fresh images.*

3. **Verify the Deployment**:
   - Check the status of the containers:
     ```bash
     docker-compose ps
     ```
   - Ensure the `postgres` container is `healthy` and the backend services are running.
   - The React frontend is available at: `http://localhost:5173`
   - The Go API Gateway is available at: `http://localhost:8080`

## Stopping the Application

To stop and remove all containers, networks, and volumes (except the persistent Postgres data), run:
```bash
docker-compose down
```

To also remove the persistent database volume (wiping all data), run:
```bash
docker-compose down -v
```
