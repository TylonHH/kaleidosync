FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY index.html vite.config.ts tsconfig.json ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=80
WORKDIR /app
RUN npm install --ignore-scripts --omit=dev --no-audit --no-fund express@5.1.0 compression@1.8.2 helmet@8.1.0 && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server.js audius.js ./
COPY package.json ./package.json
EXPOSE 80
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "fetch('http://127.0.0.1:80/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
