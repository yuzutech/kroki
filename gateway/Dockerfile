FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
RUN mkdir -p public && npm run build
USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
