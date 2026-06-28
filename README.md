# RouteLens

RouteLens is a geography-focused AI image generation app that turns a selected route into a visual journey.

Users pick an origin and destination on a map, choose a fixed visual style, and generate three AI-created scenes: departure, midway, and arrival. The images are stored server-side and shown in a persistent journey gallery.

> AI-generated scenes inspired by the geography along your route.

## Project Status

This repository is being built in small vertical slices.

Current slice:

- `docs/system-design.md` documents the product, architecture, API plan, data model, and trade-offs.
- `api/` contains the initial NestJS backend scaffold.
- `api/prisma/schema.prisma` defines the first database model for journeys, scenes, and scene image history.
- the API issues an anonymous `route_lens_session` cookie for user separation.

Not implemented yet:

- Next.js frontend
- Prisma migrations and database access
- journey APIs
- Google Routes and Geocoding
- Gemini image generation
- Supabase Storage

## Planned Stack

- Frontend: Next.js, React, TypeScript, MapLibre GL
- Backend: NestJS, TypeScript
- Database: Supabase PostgreSQL
- Image storage: Supabase Storage
- Geo APIs: Google Routes API and Google Geocoding API
- AI images: Vercel AI SDK with Gemini
- Deployment: separate Fly.io apps for `web` and `api`

## Repository Layout

```text
.
├── api/                    NestJS backend
├── docs/                   system design and submission notes
├── web/                    planned Next.js frontend
├── package.json            root workspace scripts
└── pnpm-workspace.yaml     pnpm workspace config
```

## Development

Install dependencies:

```bash
pnpm install
```

Run the API locally:

```bash
pnpm api:start:dev
```

Build the API:

```bash
pnpm api:build
```

Run API unit tests:

```bash
pnpm api:test
```

Validate the Prisma schema:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/route_lens" pnpm api:prisma:validate
```

Create a development migration:

```bash
pnpm api:prisma:migrate --name init
```

The initial API exposes:

```text
GET /health
```

## Design

See [docs/system-design.md](docs/system-design.md) for the architecture, request journey, API plan, data model, failure handling, and build process.
