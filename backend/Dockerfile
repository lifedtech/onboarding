FROM node:20-alpine

# Install openssl for Prisma support in Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency specifications & Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (production + prisma CLI devDependencies)
# This will automatically trigger 'postinstall' which runs 'prisma generate'
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose API service port
EXPOSE 3001

# Command is overridden in docker-compose for database syncing/seeding
# Run migrations before starting server in production
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
