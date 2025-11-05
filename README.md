# github-tracker

A TypeScript **monorepo** for tracking GitHub repositories and their releases.  
Backend is **Koa + GraphQL + TypeORM (PostgreSQL)**.  
Frontend (scaffold-ready) to use **Vite + React + MUI** with **TanStack Query** for fetching & caching.

---

## Monorepo layout

> Based on the workspace paths (e.g., `apps/backend/src/graphql/resolvers.ts`, `apps/backend/src/entities/*`).

```
github-tracker/
  apps/
    backend/
      src/
        entities/
          Release.ts
          Repository.ts
        graphql/
          schema.ts
          resolvers.ts
          context.ts
          index.ts
        db/
          data-source.ts
          migrate.ts
          migrations/
            1730711111000-Init.ts
        env.ts
        index.ts
        server.ts
      package.json
      tsconfig.json
    frontend/
      src/
        App.css
        App.tsx
      vite.config.ts
      package.json
  packages/
    shared/
      src/index.ts
      package.json
    tsconfig/
      base.json
      package.json
  pnpm-workspace.yaml
  package.json
  .npmrc
  .gitignore
  .env.example
```

---

## Tech Stack

- **Workspace:** pnpm workspaces
- **Backend:** Node 22, Koa, GraphQL (`graphql-http`), TypeORM, PostgreSQL, Zod, Octokit
- **Frontend:** Vite, React, MUI, TanStack Query
- **Testing:** Vitest
- **Build:** tsup / tsx

---

## Getting Started

### Prerequisites

- Node 22+
- pnpm 10+
- PostgreSQL 14+ (with `pgcrypto` extension recommended)

### 1) Clone & install

```bash
pnpm install
```

### 2) Environment

Create `.env` (see example below):

```bash
cp .env.example .env
```

`.env.example`

```ini
# Server
PORT=3000
NODE_ENV=development

# GitHub (token recommended for better rate limits)
GITHUB_TOKEN=your_github_token

# Database (choose URL or individual fields)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/github_tracker
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_NAME=github_tracker
DB_SSL=false
DB_SYNC=false
```

Enable `pgcrypto` (UUIDs):

```sql
CREATE DATABASE github_tracker;
\c github_tracker
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### 3) Database migrations

```bash
pnpm -F @github-tracker/backend db:migrate
```

### 4) Run in dev

```bash
# Backend
pnpm -F @github-tracker/backend dev
# Frontend (if present)
pnpm -F @github-tracker/frontend dev
```

- GraphQL: <http://localhost:3000/graphql> (GraphiQL served in dev)

---

## Backend

### GraphQL

- **Endpoint:** `POST /graphql` (GET serves GraphiQL in dev)
- **Examples:**

```graphql
# Add or upsert a repository
mutation {
  addRepository(input: {owner: "facebook", name: "react"}) {
    id
    owner
    name
    url
  }
}

# List releases (sorted newest first)
query {
  releases {
    id
    tag
    publishedAt
    seen
    repository {
      name
    }
  }
}
```

### Entities (TypeORM)

`src/entities/Repository.ts`

```ts
// simplified shape
export class RepositoryEntity {
  id!: string; // uuid
  owner!: string; // e.g., "facebook"
  name!: string; // e.g., "react"
  url!: string; // repo HTML URL
  releases!: ReleaseEntity[];
}
```

`src/entities/Release.ts`

```ts
export class ReleaseEntity {
  id!: string; // uuid
  repo!: RepositoryEntity; // ManyToOne
  tag!: string; // tag_name
  title!: string | null;
  url!: string | null;
  publishedAt!: Date;
  seen!: boolean;
}
```

### (Planned) Validation (Zod)

We validate request payloads in parse env:

```ts
// POST /api/repositories
import {z} from 'zod';
const Body = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url().optional()
});
const body = Body.parse(ctx.input);
```

---

## (Planned) GitHub Integration (Octokit)

### Services

`src/services/github.ts` (examples)

- **Fetch release DTOs without persisting**

```ts
export async function fetchGithubReleasesForRepository(ds, repoId) {
  /* ... */
}
```

- **Sync & upsert releases into DB**

```ts
export async function syncReleasesFromGithub() {
  /* ... */
}
```

> The GraphQL layer call these services.

---

## (Planned) Server-Sent Events (SSE)

**Goal:** push new releases to the frontend when GitHub sync completes—no user click required.

Sketch:

```ts
// SSE stream
// trigger background sync, emit events

// Implement an SSE middleware and emit messages like:
// event: releases-sync
// data: { repoId, count, finished: true }
```

---

## (Planned) Frontend

### Design goals

- Use **TanStack Query** for fetch/caching/invalidation.
- Provide a top-level **Context Provider** to avoid prop drilling.
- Use **MUI** for components & theming.

#### Providers

`apps/frontend/src/providers/AppProviders.tsx`

```tsx
import {PropsWithChildren} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {CssBaseline, ThemeProvider, createTheme} from '@mui/material';

const client = new QueryClient();

export function AppProviders({children}: PropsWithChildren) {
  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
```

#### HTTP utilities (using `fetch`)

`apps/frontend/src/api/client.ts`

```ts
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  /* ... */
}
```

#### Releases hooks

`apps/frontend/src/api/releases.ts`

```ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {http} from './client';

export type Release = {
  id: string;
  tag: string;
  title: string | null;
  url: string | null;
  publishedAt: string;
  seen: boolean;
};

export function useReleases(repoId?: string) {
  /* ... */
}

export function useMarkSeen() {
  /* ... */
}
```

#### App wiring

`apps/frontend/src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {AppProviders} from './providers/AppProviders';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
```

---

## Scripts

At the repo root:

```json
{
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r --parallel dev",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "clean": "pnpm -r clean"
  }
}
```

Backend (in `apps/backend/package.json`):

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsup src/index.ts --format esm --dts --out-dir dist --clean",
    "start": "node dist/index.js",
    "db:migrate": "tsx src/db/migrate.ts"
  }
}
```

---

## Work intended to complete (scope & roadmap)

- [ ] **Service:** Call GitHub API to **fetch release information** and return it shaped like the **`ReleaseEntity`**.
- [ ] **Service:** **Sync** latest releases from GitHub into the database.
- [ ] **Realtime:** Add **SSE** to stream sync progress / new releases to the client automatically.
- [ ] **Validation:** Add **Zod** schemas for request objects (REST and GraphQL inputs).
- [ ] **Frontend:** Use **TanStack Query** as the fetch/caching layer with a top-level **Context Provider** to limit prop drilling.
- [ ] **UI:** Use **MUI** for styling, theming, and layout (table/list for releases, repo chooser, “mark seen” UX).

---

## Testing

- Unit tests with **Vitest** (planned).
- Suggested: test services (`github.ts`), resolvers, and REST handlers with request/response fakes.
