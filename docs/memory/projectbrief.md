# Project Brief

## 1. What This Project Is
This repository is the Excalidraw monorepo: a TypeScript/React codebase that contains:
- The standalone Excalidraw web app
- The embeddable Excalidraw React package for other applications
- Shared internal packages (math, element logic, utilities, common primitives)
- Integration examples and build/release tooling

Key workspace definition is in package.json.

## 2. Primary Product Goals
- Deliver a browser-based, hand-drawn style whiteboard/diagramming experience.
- Support embedding Excalidraw as a reusable React component in external apps.
- Provide collaboration-ready app capabilities (real-time/collab-oriented modules, Firebase and socket integrations).
- Keep core logic modular and publishable via separate packages.
- Maintain reproducible build, test, and release workflows for app and packages.

Relevant sources:
- Main app: excalidraw-app
- Embeddable library package: package.json
- Examples: examples

## 3. Main Artifacts In The Repository
- Application artifact:
  - Excalidraw web app source in excalidraw-app
- Library artifacts:
  - excalidraw
  - common
  - math
  - element
  - utils
- Integration/sample artifacts:
  - Next.js example in with-nextjs
  - Browser script/Vite example in with-script-in-browser
- Infrastructure/config artifacts:
  - Containerization: Dockerfile, docker-compose.yml
  - Testing setup: vitest.config.mts
  - TS config: tsconfig.json
  - Firebase rules/indexes: firebase-project
  - Deployment config: vercel.json

## 4. Main Tech Stack
- Language: TypeScript
- UI framework: React 19
- Build/dev tooling: Vite
- Monorepo/package management: Yarn workspaces (Yarn 1)
- Testing: Vitest with jsdom
- Quality tooling: ESLint, Prettier
- Runtime integrations in app: Firebase, Socket.IO client, Sentry
- Deployment/runtime options: Vercel and Docker + Nginx

References:
- Root deps/scripts: package.json
- App deps/scripts: package.json

## 5. Environment Requirements
- Node.js >= 18.0.0 (declared in package.json and package.json)
- Yarn 1.22.x (declared package manager in package.json)
- For container workflow: Docker / Docker Compose via Dockerfile and docker-compose.yml
- Typical frontend/browser tooling expectations are captured in app browserslist in package.json

## 6. Repository File Structure (High Level)
- package.json
  Root workspace, shared scripts, dependency graph entry point.
- excalidraw-app
  Main product application code.
- packages
  Publishable/shared packages:
  - excalidraw
  - common
  - math
  - element
  - utils
- examples
  Integration demos and starter usage patterns.
- scripts
  Build/release/versioning/localization scripts.
- firebase-project
  Firebase project config and security rules.
- public
  Static public assets.
- tsconfig.json, vitest.config.mts, vercel.json, docker-compose.yml, Dockerfile
  Core project configuration and deployment/runtime setup.

## Details
For detailed architecture → see docs/technical/architecture.md
For domain glossary → see docs/product/domain-glossary.md
