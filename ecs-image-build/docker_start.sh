#!/bin/bash
#
# Start script for confirmation statement web

PORT=3000

export NODE_PORT=${PORT}
exec node -r /opt/openTelemetry.js /opt/bin/www.js -- ${PORT}
