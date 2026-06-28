FROM node:22-alpine AS builder

RUN apk add --no-cache openssl
RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY api/package.json ./api/package.json

RUN pnpm install --frozen-lockfile --filter @route-lens/api...

COPY api ./api

# prisma.config.ts evaluates env("DATABASE_URL") at load time; satisfy it with a
# throwaway value so `prisma generate` (no DB connection needed) can run.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

RUN pnpm --filter @route-lens/api prisma:generate
RUN pnpm --filter @route-lens/api build


FROM node:22-alpine AS runtime

RUN apk add --no-cache openssl ca-certificates
RUN corepack enable

WORKDIR /workspace

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /workspace/package.json ./package.json
COPY --from=builder /workspace/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /workspace/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /workspace/node_modules ./node_modules

COPY --from=builder /workspace/api/package.json ./api/package.json
COPY --from=builder /workspace/api/node_modules ./api/node_modules
COPY --from=builder /workspace/api/dist ./api/dist
COPY --from=builder /workspace/api/prisma.config.ts ./api/prisma.config.ts
COPY --from=builder /workspace/api/prisma ./api/prisma

WORKDIR /workspace/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
