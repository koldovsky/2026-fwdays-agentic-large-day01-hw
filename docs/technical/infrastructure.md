# Infrastructure

## Runtime and Build
- Frontend stack: React + Vite.
- Monorepo orchestration: Yarn workspaces.
- Type/lint/test tooling: TypeScript, ESLint, Prettier, Vitest.

## Deployment/Container Files
- `Dockerfile` and `docker-compose.yml` for containerized build/run.
- `vercel.json` for Vercel deployment config.

## External Integrations
- Firebase (rules and config in `firebase-project/`).
- Socket.IO client for collaboration features.
- Sentry for monitoring.
