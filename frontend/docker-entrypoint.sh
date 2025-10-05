#!/bin/sh

# Docker entrypoint script for React frontend
# This script injects environment variables into the built React app at runtime

set -e

# Default values
API_URL=${API_URL:-"http://localhost:8765/api"}
APP_NAME=${APP_NAME:-"Course Selling Platform"}
APP_VERSION=${APP_VERSION:-"1.0.0"}

# Create runtime configuration file
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  API_URL: "${API_URL}",
  APP_NAME: "${APP_NAME}",
  APP_VERSION: "${APP_VERSION}"
};
EOF

echo "Runtime configuration created:"
cat /usr/share/nginx/html/config.js

# Replace environment variables in index.html if needed
if [ -f /usr/share/nginx/html/index.html ]; then
    # Add config.js script to index.html if not already present
    if ! grep -q "config.js" /usr/share/nginx/html/index.html; then
        sed -i 's|</head>|  <script src="/config.js"></script>\n  </head>|' /usr/share/nginx/html/index.html
    fi
fi

echo "Frontend application configured with:"
echo "  API_URL: ${API_URL}"
echo "  APP_NAME: ${APP_NAME}"
echo "  APP_VERSION: ${APP_VERSION}"

# Execute the main command
exec "$@"