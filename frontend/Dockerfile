# ==============================================================================
# React Frontend (Vite) — Dockerfile for Development
# ==============================================================================

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
