FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for pandas/numpy/catboost
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy only the backend requirements to cache the pip install step
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy all backend source code
COPY backend /app/backend

# Use shell form of CMD so that Railway's $PORT environment variable is evaluated correctly
CMD gunicorn backend.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
