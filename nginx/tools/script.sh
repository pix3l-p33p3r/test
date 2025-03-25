#!/bin/bash
echo "Starting Nginx"

# Test NGINX configuration
nginx -t
if [ $? -ne 0 ]; then
    echo "NGINX configuration test failed!"
    exit 1
fi

# Start NGINX in foreground
nginx -g "daemon off;"
