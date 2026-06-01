FROM python:3.10-slim

WORKDIR /app

# Install system deps (important for some AI libs)
RUN apt-get update && apt-get install -y build-essential

# Copy requirements
COPY requirements.txt .
COPY . .

# Install python deps
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, preserving negotiationai/backend package structure
COPY backend /app/negotiationai/backend

# Copy RAG data (VERY IMPORTANT)
COPY data /app/negotiationai/data

# Expose port
EXPOSE 10000

# Run FastAPI
CMD ["uvicorn", "negotiationai.backend.main:app", "--host", "0.0.0.0", "--port", "10000"]