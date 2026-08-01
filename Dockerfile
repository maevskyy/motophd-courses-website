# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.10.0 --activate

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
  DATABASE_URI=postgres://motophd:motophd@localhost:5432/motophd \
  PAYLOAD_SECRET=build-time-placeholder \
  pnpm build

# Рантайм сайта. Только standalone: он уже несёт свой обрезанный node_modules,
# полный сюда копировать НЕ надо — из-за этого образ раздувался до ~1.6 GB.
FROM base AS runner

ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]

# Образ для разовых операций: миграции и seed. Тянется редко (только на деплое),
# поэтому здесь полный node_modules и исходники — им нужен payload CLI.
FROM base AS ops

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/src ./src

CMD ["pnpm", "payload", "migrate"]
