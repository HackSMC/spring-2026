# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base

FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then \
  yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
  npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then \
  corepack enable pnpm && pnpm install; \
  else \
  echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
  fi

COPY . .

ARG NEXT_PUBLIC_QR_SERVICE_URL
ENV NEXT_PUBLIC_QR_SERVICE_URL=${NEXT_PUBLIC_QR_SERVICE_URL}
ARG NEXT_PUBLIC_OUTREACH_SERVICE_URL
ENV NEXT_PUBLIC_OUTREACH_SERVICE_URL=${NEXT_PUBLIC_OUTREACH_SERVICE_URL}
ARG NEXT_PUBLIC_ACCOUNT_SERVICE_URL
ENV NEXT_PUBLIC_ACCOUNT_SERVICE_URL=${NEXT_PUBLIC_ACCOUNT_SERVICE_URL}
ARG NEXT_PUBLIC_APPLY_SERVICE_URL
ENV NEXT_PUBLIC_APPLY_SERVICE_URL=${NEXT_PUBLIC_APPLY_SERVICE_URL}
ARG NEXT_PUBLIC_SUPABASE_KEY
ENV NEXT_PUBLIC_SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_KEY}
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ARG NEXT_PUBLIC_PRODUCTION
ENV NEXT_PUBLIC_PRODUCTION=${NEXT_PUBLIC_PRODUCTION}

RUN \
  if [ -f yarn.lock ]; then \
  NODE_ENV=production yarn build; \
  elif [ -f package-lock.json ]; then \
  NODE_ENV=production npm run build; \
  elif [ -f pnpm-lock.yaml ]; then \
  NODE_ENV=production pnpm build; \
  else \
  NODE_ENV=production npm run build; \
  fi

FROM base AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  chown -R nextjs:nodejs /app

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

ARG NEXT_PUBLIC_QR_SERVICE_URL
ENV NEXT_PUBLIC_QR_SERVICE_URL=${NEXT_PUBLIC_QR_SERVICE_URL}
ARG NEXT_PUBLIC_OUTREACH_SERVICE_URL
ENV NEXT_PUBLIC_OUTREACH_SERVICE_URL=${NEXT_PUBLIC_OUTREACH_SERVICE_URL}
ARG NEXT_PUBLIC_ACCOUNT_SERVICE_URL
ENV NEXT_PUBLIC_ACCOUNT_SERVICE_URL=${NEXT_PUBLIC_ACCOUNT_SERVICE_URL}
ARG NEXT_PUBLIC_APPLY_SERVICE_URL
ENV NEXT_PUBLIC_APPLY_SERVICE_URL=${NEXT_PUBLIC_APPLY_SERVICE_URL}
ARG NEXT_PUBLIC_SUPABASE_KEY
ENV NEXT_PUBLIC_SUPABASE_KEY=${NEXT_PUBLIC_SUPABASE_KEY}
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ARG NEXT_PUBLIC_PRODUCTION
ENV NEXT_PUBLIC_PRODUCTION=${NEXT_PUBLIC_PRODUCTION}

EXPOSE 3000

CMD ["node", "server.js"]