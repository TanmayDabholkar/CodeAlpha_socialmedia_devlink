# Multi-architecture Node.js Alpine base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install server dependencies
RUN cd server && npm install --production

# Copy application source code
COPY . .

# Expose backend & frontend port
EXPOSE 4000

# Environment variables
ENV PORT=4000
ENV NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/posts || exit 1

# Start the universal server
CMD ["node", "server/server.js"]
