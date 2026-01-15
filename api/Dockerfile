FROM node:24-slim

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm run build

EXPOSE 4000

CMD ["sh","-lc","npx prisma migrate deploy && node dist/index.js"]
