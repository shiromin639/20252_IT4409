FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .

# Set environment variable during build (can be overridden, but usually Vite embeds this)
ARG VITE_API_URL=http://localhost:8080/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine
# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
