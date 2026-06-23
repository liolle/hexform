# Build stage (optional, for production optimization)
FROM python:3.11-slim AS builder

WORKDIR /app

COPY requirement.txt .
RUN pip install --user --no-cache-dir -r requirement.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY main.py .
COPY alembic.ini .
COPY alembic ./alembic
COPY database ./database
COPY routers ./routers
COPY dto ./dto
COPY services ./services
COPY utils ./utils

CMD sh -c "alembic upgrade head && fastapi run main.py --host 0.0.0.0 --port 8000"
