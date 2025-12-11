# NoYouPick API - Cloud Run Deployment
# Uses Vertex AI with Application Default Credentials (no API keys!)

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package.json and node_modules from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib ./lib

# Prune dev dependencies
RUN npm prune --omit=dev

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Run as non-root user
USER node

EXPOSE 8080

CMD ["node", "lib/cloudrun.js"]
