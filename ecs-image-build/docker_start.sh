#!/bin/bash
#
# Start script for confirmation statement web

PORT=3000

source "server/config/.env"
export NODE_PORT=${PORT}
node server.js
