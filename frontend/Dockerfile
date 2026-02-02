FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --frozen-lockfile

COPY . .

ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL

RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
