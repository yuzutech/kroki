FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/contracts/package.json packages/contracts/tsconfig.json ./packages/contracts/
COPY packages/contracts/src ./packages/contracts/src
COPY packages/diagram-config/package.json packages/diagram-config/tsconfig.json ./packages/diagram-config/
COPY packages/diagram-config/src ./packages/diagram-config/src
COPY gateway/package.json gateway/tsconfig.json ./gateway/
COPY gateway/src ./gateway/src
COPY scripts ./scripts

RUN npm ci && npm --workspace=@diagram-as-code/gateway run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=build /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build /app/gateway/package.json ./gateway/package.json
COPY --from=build /app/gateway/dist ./gateway/dist
COPY --from=build /app/scripts ./scripts

USER node
EXPOSE 9000
CMD ["node", "gateway/dist/server.js"]
