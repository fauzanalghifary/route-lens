# Deployment

RouteLens runs as two Fly apps in `sin`:

- `route-lens-api` — NestJS + Prisma, port 3001, healthcheck `/health`
- `route-lens-web` — Next.js standalone, port 3000

Postgres is managed externally on Supabase. The browser calls the API directly via `NEXT_PUBLIC_API_URL` (CORS allows the web origin).

## One-time setup

### 1. Provision Postgres on Supabase

Create a new Supabase project. Grab the **transaction pooler** connection string from Project Settings → Database (port 6543, append `?pgbouncer=true&connection_limit=1` for Prisma compatibility).

### 2. Create the Fly apps

From the repo root:

```sh
flyctl launch --no-deploy --copy-config --config fly.api.toml --name route-lens-api
flyctl launch --no-deploy --copy-config --config fly.web.toml --name route-lens-web
```

If the names are taken, edit `app =` in each toml and update `WEB_ORIGIN` / `NEXT_PUBLIC_API_URL` accordingly.

### 3. Set API secrets

```sh
flyctl secrets set DATABASE_URL="postgresql://..." --app route-lens-api
```

Use the Supabase pooler URL from step 1.

### 4. Wire up the GitHub Action

Add `FLY_API_TOKEN` to the repo secrets:

```sh
flyctl tokens create deploy -x 8760h
# paste into GitHub → repo → Settings → Secrets → Actions → FLY_API_TOKEN
```

### 5. First deploy

Push to `main` (or run the workflow manually). The action deploys the API first (which runs `prisma migrate deploy` as a release command), then the web app.

## Day-to-day

Any push to `main` that touches `api/`, `web/`, the fly tomls, or the lockfiles triggers a redeploy. To force one, run the **Fly Deploy** workflow from the Actions tab.

To deploy manually from a laptop:

```sh
flyctl deploy --config fly.api.toml --remote-only
flyctl deploy --config fly.web.toml --remote-only
```

## Migrations

`prisma migrate deploy` runs automatically as the API's Fly release command. To apply migrations from a laptop instead:

```sh
DATABASE_URL="..." pnpm --filter @route-lens/api exec prisma migrate deploy
```
