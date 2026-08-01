# GraphSafe Backend

Production-ready backend foundation for GraphSafe. Node.js + Express + TypeScript + Prisma
(PostgreSQL / Neon-compatible). This step implements infrastructure only — no auth, no
business logic, no GraphSafe-specific features yet.

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
| `JWT_SECRET`   | Placeholder secret, reserved for the future auth step     | Yes |
| `CORS_ORIGIN`  | Allowed origin for CORS                                   | No (default `http://localhost:3000`) |

The app **fails fast on startup** if a required variable is missing or invalid — see
`src/config/env.ts`.

## Database (Prisma)

Generate the Prisma client and run the initial migration against your database:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

> No application models are defined yet (see `prisma/schema.prisma`). This step only wires
> up Prisma and verifies connectivity; `server.ts` calls `prisma.$connect()` on boot and
> exits with a clear error if the database is unreachable.

## Run

```bash
npm run dev     # start with hot reload (tsx watch)
npm run build   # compile TypeScript -> dist/
npm start       # run the compiled build (dist/server.js)
```

On successful boot you should see:

```
Database connection established.
GraphSafe backend listening on port 4000 [development] — /api/v1/health
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
│   └── schema.prisma        # Prisma schema (PostgreSQL, no models yet)
├── src/
│   ├── config/
│   │   ├── env.ts           # Zod-validated environment variables (fail-fast)
│   │   └── index.ts         # Centralized app config, derived from env
│   ├── controllers/
│   │   └── health.controller.ts
│   ├── database/
│   │   └── prisma.ts        # Shared PrismaClient singleton
│   ├── middleware/
│   │   ├── errorHandler.ts  # Global error handler (last middleware registered)
│   │   ├── notFoundHandler.ts
│   │   └── requestId.ts
│   ├── repositories/        # Empty for now — future repositories (user.repository.ts,
│   │                         # project.repository.ts, etc.) will live here once real
│   │                         # models exist. No generic repository abstraction.
│   ├── routes/
│   │   ├── health.routes.ts
│   │   └── index.ts         # Aggregates all /api/v1 routes
│   ├── services/
│   │   └── health.service.ts
│   ├── types/
│   │   └── api.ts           # Shared API response types
│   ├── utils/
│   │   ├── AppError.ts      # Operational error class used across the app
│   │   └── asyncHandler.ts  # Wraps async route handlers
│   ├── validators/
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
  `services/`. Once real models exist, repositories will be the only layer that talks to
  Prisma directly — `repositories/` is intentionally empty for now rather than holding a
  generic passthrough abstraction with nothing to abstract over.
- **API responses.** Every endpoint follows one consistent envelope: success responses are
  `{ success: true, data }`, error responses are `{ success: false, message, errors? }`.
  `GET /api/v1/health` follows this convention, and future endpoints should reuse the
  `ApiSuccessResponse<T>` / `ApiErrorResponse` types in `src/types/api.ts`.
- **Errors.** All errors funnel through the single `errorHandler` middleware, registered
  last in `app.ts`. Throw an `AppError` (or a `ZodError` from validation) anywhere in the
  request lifecycle and it will be converted into the standard error envelope above. Stack
  traces / internal messages are hidden in production.
- **Config.** `process.env` is read in exactly one file (`src/config/env.ts`), validated
  with Zod, and re-exported as a typed `config` object. The process exits immediately if
  configuration is invalid, rather than failing unpredictably later.
- **Database.** The Prisma client singleton lives in `src/database/prisma.ts`, separate
  from `config/` (which holds settings, not stateful clients/connections).
- **Logging.** Morgan runs before body parsing, so even requests with malformed JSON
  bodies are logged. Every log line is correlated with the request's ID (via a custom
  Morgan token reading the ID set by the `requestId` middleware), so a single request can
  be traced through the logs end to end.
- **Health check.** `GET /api/v1/health` does not touch the database by design, so it can
  double as a lightweight liveness probe.
- **Graceful shutdown.** `SIGINT`/`SIGTERM`, plus `unhandledRejection`/`uncaughtException`,
  all funnel into one shared shutdown routine: stop accepting new connections, disconnect
  Prisma, exit. OS signals exit `0` on a clean close; crash events always exit non-zero. A
  guard flag ensures the routine only runs once no matter which trigger fires first, and a
  10s watchdog forces exit if shutdown hangs.

## Out of scope (future steps)

Authentication, users, projects, the dependency parser, GitHub integration, the risk
engine, reports, dashboard, and graph generation are intentionally not implemented here.
