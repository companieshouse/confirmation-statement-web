FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/local/configure-local-ssh
FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-20

WORKDIR /opt

# Copy essential files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the app
COPY dist ./dist
COPY api-enumerations ./api-enumerations
COPY docker_start.sh ./docker_start.sh

CMD ["./docker_start.sh"]

EXPOSE 3000
