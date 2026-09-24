FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm run build || npx tsc -p tsconfig.json
EXPOSE 4000
CMD ["node", "dist/server.js"]
