# Build stage
FROM node:18-alpine AS build

# Declare build time environment variables
ARG REACT_APP_NODE_ENV
ARG REACT_APP_SERVER_BASE_URL

# Set default values for environment variables
ENV REACT_APP_NODE_ENV=$REACT_APP_NODE_ENV
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with cache mount for faster builds
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]