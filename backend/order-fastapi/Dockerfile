FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml ./
COPY uv.lock* ./

RUN uv pip install --system --no-cache -r pyproject.toml

COPY . .

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${FASTAPI_PORT:-8000}"]
