#!/bin/bash
# Dev start script for confirmation-statement-web
npm i
PORT=3000
export NODE_PORT=${PORT}
exec node --inspect=0.0.0.0:9229 /opt/bin/www.js -- ${PORT}
