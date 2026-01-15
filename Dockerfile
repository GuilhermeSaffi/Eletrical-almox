# syntax=docker/dockerfile:1

FROM node:24-slim AS base
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["sh", "-lc", "export GEMINI_API_KEY=\"${GEMINI_API_KEY:-${API_KEY:-}}\"; npm run dev -- --host 0.0.0.0 --port 3000"]

FROM base AS build
ENV NODE_ENV=production
RUN npm run build

FROM nginx:alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
