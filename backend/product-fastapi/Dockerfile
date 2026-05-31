FROM python:3.11-slim

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync

# Copy source code
COPY . .

EXPOSE 8000
