FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN if [ -d "prisma" ]; then npx prisma generate; fi

CMD ["node", "index.js"]
