# `template-psql`

Standard starter for self-hosted `Next.js + PostgreSQL + Prisma + NextAuth` apps.

## Standard contract

Every app based on this template should keep the same production contract:

- `Dockerfile` for container-based deploys
- `output: "standalone"` in Next.js
- `/api/health` endpoint for health checks
- `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `AUTH_URL`, `NEXTAUTH_URL`
- optional `RUN_DB_MIGRATIONS=true` for single-instance deploys

## Local development

```bash
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Production runtime

The production container:

- builds the app with `npm run build`
- serves it on `0.0.0.0:3000`
- exposes health on `/api/health`
- can run `npm run db:migrate` at boot when `RUN_DB_MIGRATIONS=true`

## Coolify deployment

Recommended first deployment pattern:

1. Create a new project in Coolify
2. Add a PostgreSQL resource for the app
3. Create a new application from the Git repo
4. Select `Dockerfile` deploy mode
5. Set the port to `3000`
6. Add the required environment variables
7. Set a domain only after the app responds correctly on the internal URL

### Required environment variables

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
AUTH_SECRET=$(openssl rand -base64 32)
AUTH_TRUST_HOST=true
AUTH_URL=https://your-domain.example
NEXTAUTH_URL=https://your-domain.example
PORT=3000
RUN_DB_MIGRATIONS=false
```

### Migration strategy

Recommended:

- use a single replica per app at first
- keep `RUN_DB_MIGRATIONS=true` only while you are on one instance
- if you later scale horizontally, move migrations to a dedicated deploy step

## Next apps to standardize after this

- `autodoc`
- `finbara-app`

The goal is to make all of them match this template before production migration.
