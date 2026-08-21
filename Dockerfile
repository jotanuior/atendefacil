FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG APP_BASE_PATH=/atendefacil
ENV APP_BASE_PATH=${APP_BASE_PATH}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/wrangler.jsonc ./wrangler.jsonc
COPY --from=build /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
RUN chmod +x ./scripts/docker-entrypoint.sh
EXPOSE 3000
CMD ["./scripts/docker-entrypoint.sh"]
