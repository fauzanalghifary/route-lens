FROM node:22-alpine AS builder

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/package.json

RUN pnpm install --frozen-lockfile --filter @route-lens/web...

COPY web ./web

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm --filter @route-lens/web build


FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /workspace/web/.next/standalone ./
COPY --from=builder /workspace/web/.next/static ./web/.next/static
COPY --from=builder /workspace/web/public ./web/public

EXPOSE 3000

CMD ["node", "web/server.js"]
