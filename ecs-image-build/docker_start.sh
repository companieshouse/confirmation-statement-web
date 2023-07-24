#!/bin/bash
#
# Start script for confirmation statement web

PORT=3000

export NODE_PORT=${PORT}
node /app/bin/www.js -- $PORT
