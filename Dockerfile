FROM node:22.23.4-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY --chown=node:node server ./server
COPY --chown=node:node public ./public
USER node
EXPOSE 5190
CMD ["node","server/index.mjs"]
