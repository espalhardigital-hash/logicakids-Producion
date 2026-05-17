# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a non-privileged user and group
RUN addgroup --system appgroup && adduser --system --group appuser

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Make startup script executable and change ownership of the app directory
RUN chmod +x start.sh && chown -R appuser:appgroup /app

# Switch to the non-privileged user
USER appuser

# Expose port
EXPOSE 8000

# Command to run the application using start.sh
CMD ["./start.sh"]
