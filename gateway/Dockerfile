FROM node:22-alpine

# Install openssl which is required for Prisma client on alpine
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client if prisma schema exists
RUN if [ -d "prisma" ]; then npx prisma generate; fi

CMD ["node", "index.js"]
