# Stage 1: Build Vite React App
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass build time environment variables for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve built assets using Nginx
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx routing configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
