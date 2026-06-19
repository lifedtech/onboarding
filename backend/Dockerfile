FROM node:20-alpine

# Install openssl for Prisma support in Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (production + prisma CLI devDependencies)
RUN npm install

# Copy Prisma schema definition
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the backend source code
COPY . .

# Expose API service port
EXPOSE 3001

# Command is overridden in docker-compose for database syncing/seeding
# Run migrations before starting server in production
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
