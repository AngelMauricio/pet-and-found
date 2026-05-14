# Use Node 20-alpine for a lightweight footprint
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when needed
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm install

COPY . .

# Environment variables for Firebase and Cloudinary
ENV NEXT_TELEMETRY_DISABLED 1

CMD ["npm", "run", "dev"]