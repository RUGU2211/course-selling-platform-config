#!/bin/sh

# Replace environment variables in the built files
if [ -n "$VITE_API_URL" ]; then
    echo "Setting API URL to: $VITE_API_URL"
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8765|$VITE_API_URL|g" {} \;
fi

# Start nginx
exec "$@"