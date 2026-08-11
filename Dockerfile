# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package definition & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build frontend
COPY . .
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment variable to production
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server/index.js"]
