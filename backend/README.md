# GraphSafe Backend

Production-ready backend foundation for GraphSafe. Node.js + Express + TypeScript + Prisma
(PostgreSQL / Neon-compatible).

- **Phase 1** implemented infrastructure only — no auth, no business logic.
- **Phase 2** (this update) implements the full database schema and a JWT-based
  authentication system: register, login, current-user, and a reusable auth middleware.
  GraphSafe business features (GitHub integration, dependency parsing, the risk engine,
  reports, dashboard) are still out of scope — see "Out of scope" below.

## Requirements

- Node.js >= 18
- npm
- A PostgreSQL database (local, Docker, or Neon)

## Install

```bash
npm install
```

## Configure

Copy the example environment file and fill in real values:

```bash
cp .env.example .env
```

| Variable       | Description                                              | Required |
| -------------- | --------------------------------------------------------- | -------- |
| `PORT`         | Port the HTTP server listens on                          | No (default `4000`) |
| `NODE_ENV`     | `development` \| `test` \| `production`                   | No (default `development`) |
| `DATABASE_URL` | PostgreSQL connection string (Neon-compatible)            | Yes |
| `JWT_SECRET`   | Secret used to sign/verify auth JWTs                       | Yes |
| `CORS_ORIGIN`  | Allowed origin for CORS                                   | No (default `http://localhost:3000`) |

The app **fails fast on startup** if a required variable is missing or invalid — see
`src/config/env.ts`. Token expiration is fixed at 7 days (`config.auth.jwtExpiresIn`); there
are no refresh tokens in Version 1.

## Database (Prisma)

Generate the Prisma client and run the migration for the Phase 2 schema:

```bash
npx prisma generate
npx prisma migrate dev --name add_auth_and_core_schema
```

### Schema

| Model        | Purpose                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| `User`       | Account record. `email` is unique; `passwordHash` is bcrypt output and is **never** serialized in an API response. |
| `Project`    | A repository tracked by a user. `User 1—N Project` via `Project.userId`. |
| `Scan`       | One dependency scan run against a `Project`. `Project 1—N Scan` via `Scan.projectId`. Has a `ScanStatus` enum (`PENDING`, `RUNNING`, `COMPLETED`, `FAILED`). |
| `Dependency` | One resolved package found during a scan. `Scan 1—N Dependency` via `Dependency.scanId`. |
| `RiskReport` | The aggregated risk summary for a scan. `Scan 1—1 RiskReport` via a unique `RiskReport.scanId`. |

Only Phase 2 (schema + auth) is implemented behind these models — populating `Project`,
`Scan`, `Dependency`, and `RiskReport` with real data is a future phase; their repositories
exist now purely as data-access scaffolding.

## Run

```bash
npm run dev     # start with hot reload (tsx watch)
npm run build   # compile TypeScript -> dist/
npm start       # run the compiled build (dist/server.js)
```

## Authentication

All auth endpoints are namespaced under `/api/v1/auth`. Responses use the same envelope as
the rest of the API: `{ success: true, data }` or `{ success: false, message, errors? }`.

### `POST /api/v1/auth/register`

Creates a new user. `email` must be unique and `password` must be at least 8 characters;
the password is hashed with bcrypt before it is stored, and `passwordHash` is never
returned.

Request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "correcthorsebattery"
}
```

Response (`201`):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "…",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "createdAt": "…",
      "updatedAt": "…"
    }
  }
}
```

### `POST /api/v1/auth/login`

Verifies credentials and issues a JWT (7 day expiration).

Request:

```json
{
  "email": "ada@example.com",
  "password": "correcthorsebattery"
}
```

Response (`200`):

```json
{
  "success": true,
  "data": {
    "user": { "id": "…", "name": "…", "email": "…", "createdAt": "…", "updatedAt": "…" },
    "token": "eyJhbGciOi..."
  }
}
```

### `GET /api/v1/auth/me`

Protected. Requires `Authorization: Bearer <token>`. Returns the authenticated user (no
`passwordHash`).

Response (`200`):

```json
{
  "success": true,
  "data": {
    "user": { "id": "…", "name": "…", "email": "…", "createdAt": "…", "updatedAt": "…" }
  }
}
```

Unauthenticated or invalid/expired token requests receive `401` with the standard error
envelope.

### Protecting future routes

Any future route can be protected by adding the `authenticate` middleware
(`src/middleware/auth.ts`), which verifies the bearer JWT, loads the user, and attaches it
to `req.user` (typed via an Express `Request` augmentation, same pattern as `requestId`):

```ts
import { authenticate } from '../middleware/auth';

router.get('/projects', authenticate, listProjects);
```

## Verify

```bash
curl http://localhost:4000/api/v1/health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-08-01T00:00:00.000Z",
    "environment": "development"
  }
}
```

## Code quality

```bash
npm run lint        # ESLint
npm run lint:fix    # ESLint with autofix
npm run format      # Prettier
npm run typecheck   # tsc --noEmit (strict mode)
```

## Folder structure

```
backend/
├── prisma/
│   └── schema.prisma        # User, Project, Scan, Dependency, RiskReport
├── src/
│   ├── config/
│   │   ├── env.ts           # Zod-validated environment variables (fail-fast)
│   │   └── index.ts         # Centralized app config, derived from env
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── health.controller.ts
│   ├── database/
│   │   └── prisma.ts        # Shared PrismaClient singleton
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware (attaches req.user)
│   │   ├── errorHandler.ts  # Global error handler (last middleware registered)
│   │   ├── notFoundHandler.ts
│   │   └── requestId.ts
│   ├── repositories/
│   │   ├── dependency.repository.ts
│   │   ├── project.repository.ts
│   │   ├── riskReport.repository.ts
│   │   ├── scan.repository.ts
│   │   └── user.repository.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── health.routes.ts
│   │   └── index.ts         # Aggregates all /api/v1 routes
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── health.service.ts
│   ├── types/
│   │   ├── api.ts           # Shared API response types
│   │   └── auth.ts          # SafeUser / JwtPayload types
│   ├── utils/
│   │   ├── AppError.ts      # Operational error class used across the app
│   │   ├── asyncHandler.ts  # Wraps async route handlers
│   │   ├── jwt.ts           # sign/verify helpers around jsonwebtoken
│   │   └── toSafeUser.ts    # Strips passwordHash off a User
│   ├── validators/
│   │   ├── auth/
│   │   │   ├── login.schema.ts
│   │   │   └── register.schema.ts
│   │   └── validate.ts      # Reusable Zod validation middleware factory
│   ├── app.ts                # Express app: middleware + routes + error handling
│   └── server.ts             # Entrypoint: DB connect, listen, graceful shutdown
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
└── package.json
```

## Architecture notes

- **Layering.** Routes are thin and only wire a path to a controller. Controllers are thin
  and only handle req/res; all logic that isn't pure request/response plumbing lives in
  `services/`. Only `repositories/` talks to Prisma directly. Auth follows this exactly:
  `auth.routes.ts` → `auth.controller.ts` → `auth.service.ts` → `user.repository.ts` →
  Prisma. `project`/`scan`/`dependency`/`riskReport` repositories exist as data-access
  scaffolding for future phases and currently have no corresponding services.
- **API responses.** Every endpoint follows one consistent envelope: success responses are
  `{ success: true, data }`, error responses are `{ success: false, message, errors? }`.
- **Errors.** All errors — including auth failures (`AppError.unauthorized`/`badRequest`)
  and Zod validation errors — funnel through the single existing `errorHandler` middleware.
  No parallel error-handling path was introduced for auth.
- **Passwords & tokens.** Passwords are hashed with bcrypt (12 salt rounds) in
  `auth.service.ts` — plaintext passwords are never stored or logged. JWTs are signed with
  `JWT_SECRET` and a fixed 7 day expiration (`utils/jwt.ts`); `passwordHash` is stripped
  before a `User` can reach a response or `req.user` (`utils/toSafeUser.ts`), which is the
  only place that conversion happens.
- **Config.** `process.env` is read in exactly one file (`src/config/env.ts`), validated
  with Zod, and re-exported as a typed `config` object.
- **Database.** The Prisma client singleton lives in `src/database/prisma.ts`.
- **Logging / Health / Graceful shutdown.** Unchanged from Phase 1 — see git history for
  details.

## Out of scope (future phases)

GitHub integration, the dependency parser, the risk engine, reports generation, the
dashboard, dependency graph generation, and the frontend are intentionally not implemented
here. `Project`, `Scan`, `Dependency`, and `RiskReport` exist in the schema with basic
repository scaffolding, but nothing yet writes real data into them beyond what a future
phase's services will add.
