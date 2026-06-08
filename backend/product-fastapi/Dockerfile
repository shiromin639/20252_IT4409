FROM python:3.12-slim

WORKDIR /app

# Copy the uv binary from the official astral image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency definition files
COPY pyproject.toml uv.lock* ./

# Install dependencies system-wide inside the container
RUN uv pip install --system --no-cache -r pyproject.toml

COPY . .

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${FASTAPI_PORT:-8000}"]
