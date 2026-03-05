FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./
COPY --from=builder /app/package*.json ./

RUN npm ci --only=production && npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
