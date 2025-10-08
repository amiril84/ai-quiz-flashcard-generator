FROM python:3.11-slim

# Install system dependencies including Tor
RUN apt-get update && apt-get install -y \
    tor \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend/ .
COPY index.html .
COPY script.js .
COPY styles.css .

# Create a startup script that runs Tor and then the Flask app
RUN echo '#!/bin/bash\n\
# Start Tor in the background\n\
tor &\n\
\n\
# Wait for Tor to establish connection (usually takes 10-30 seconds)\n\
echo "Waiting for Tor to start..."\n\
sleep 15\n\
\n\
# Check if Tor is running\n\
if pgrep -x "tor" > /dev/null; then\n\
    echo "Tor started successfully"\n\
else\n\
    echo "Warning: Tor may not have started properly"\n\
fi\n\
\n\
# Start the Flask application\n\
exec gunicorn --bind 0.0.0.0:$PORT app:app\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose port (Render will set the PORT env variable)
EXPOSE 10000

# Run the startup script
CMD ["/app/start.sh"]
