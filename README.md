# CoffeeCup

Group availability scheduling — create an event, share a link, and find when everyone is free. No accounts required.

## Stack

- [Next.js](https://nextjs.org) App Router + TypeScript
- Tailwind CSS
- [Neon](https://neon.tech) PostgreSQL (`@neondatabase/serverless`)
- Zod validation
- date-fns + `@date-fns/tz`
- Vitest

> This repo already used Neon for Postgres. The MVP keeps that setup (equivalent to the Supabase schema described in the product brief) and performs all writes through Next.js server actions so database credentials stay server-side.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` (or `.env`):

```bash
cp .env.example .env.local
```

Set:

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon (or any Postgres) connection string |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute origin for share links (e.g. `https://coffeecup.world`) |

### 3. Create a Neon project

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Open **Dashboard → Connect** and copy the connection string.
3. Paste it into `DATABASE_URL` in `.env.local`.

Any standard Postgres provider works if you prefer not to use Neon.

### 4. Apply the database migration

```bash
npm run db:migrate
```

This applies every SQL file in `db/migrations/` (currently `001_create_scheduling.sql`): events, dates, participants (with hashed edit tokens), and availability slots.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Vitest unit tests |
| `npm run format` | Prettier write (if available) / eslint fix |
| `npm run db:migrate` | Apply SQL migrations |

## Testing

```bash
npm test
```

Tests cover slot generation, intervals, event validation, selection/deselection, heatmap counts/intensity, duplicate slot filtering, and edit-token hashing.

## Deploy

1. Push the repo to GitHub.
2. Import the project on [Vercel](https://vercel.com) (or your host of choice).
3. Set `DATABASE_URL` and optionally `NEXT_PUBLIC_SITE_URL` in the host’s environment settings.
4. Run migrations against the production database (`npm run db:migrate` with the production `DATABASE_URL`).
5. Deploy.

## Product notes

- Organizer timezone is captured in the browser at creation time and shown on the event page.
- Participant edit tokens are stored only as hashes in the database; the raw token lives in `localStorage` on that browser.
- No accounts, OAuth, calendar sync, or email invitations in this MVP.
