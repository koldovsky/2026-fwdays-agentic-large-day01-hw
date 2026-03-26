# Project Brief

## What the Project Is

Excalidraw is an open-source, browser-based collaborative whiteboard that renders all drawings in a hand-drawn / sketch visual style. It is structured as a Yarn workspace monorepo serving two distinct deployable artifacts:

1. **`excalidraw-app`** — the hosted single-page web application (deployed on Vercel; also available as a Docker/nginx image for self-hosting).
2. **`@excalidraw/excalidraw`** — a publishable React component library (npm, MIT license) that embeds the full editor into any React application.

## Who It Serves

- **End users** accessing `excalidraw.com` or a self-hosted instance: individuals and teams who need a lightweight, shareable diagramming/whiteboarding tool with no account required.
- **Developers / product teams** who want to embed the whiteboard editor directly into their own applications via the npm package (`@excalidraw/excalidraw`).
- **Contributors / open-source community**: the codebase is structured to make package responsibilities clear and to allow independent release of sub-packages.

## Main Goal

Provide a fast, frictionless collaborative drawing experience in the browser with a consistent hand-drawn aesthetic, while also offering a first-class embeddable React component API for third-party integration.

## App vs Package Distinction

| Concern | `excalidraw-app` | `@excalidraw/excalidraw` |
| --- | --- | --- |
| Entry point | `excalidraw-app/App.tsx` (React function component) | `packages/excalidraw/index.tsx` (barrel export) |
| Core editor | Consumes `<Excalidraw />` from the library | **Is** the `<Excalidraw />` component |
| Collaboration transport | `collab/Collab.tsx` — Socket.IO + Firebase | Not included; host app must provide transport |
| Persistence | localStorage, IndexedDB, Firebase Firestore/Storage | Not included; host app is responsible |
| Authentication | None (Firebase anonymous sessions + optional `excplus-auth` cookie) | Not applicable |
| Monitoring | Sentry (guarded to `excalidraw.com` hosts only) | Not applicable |
| PWA / service worker | Yes (`vite-plugin-pwa`) | No |
| Published to npm | No (`private: true`) | Yes (`@excalidraw/excalidraw@0.18.0`) |
| Peer dependencies | N/A | `react ^17 \| ^18 \| ^19`, `react-dom ^17 \| ^18 \| ^19` |
| Version | `1.0.0` (internal) | `0.18.0` |

## Internal Sub-packages (in `packages/`)

| Package | Version | Role |
| --- | --- | --- |
| `@excalidraw/common` | 0.18.0 | Shared constants, color utilities (`tinycolor2`), event bus |
| `@excalidraw/math` | 0.18.0 | 2D geometry primitives (points, vectors, curves, ellipses, polygons) |
| `@excalidraw/element` | 0.18.0 | Element data model, factory functions, bounds, collision, rendering shapes |
| `@excalidraw/excalidraw` | 0.18.0 | Core editor component, actions, renderer, history, state management |
| `@excalidraw/utils` | 0.1.2 | Utility functions (file I/O, compression, encoding, font subsetting) |

Build order is enforced: `common → math → element → excalidraw`.

## Related Docs

- [Technical Architecture](../technical/architecture.md) — package dependency graph, monorepo tiers, data flow diagrams, rendering pipeline
- [Product Requirements (PRD)](../product/PRD.md) — full feature catalogue (§5), user scenarios (§4), functional requirements (§6), open questions (§8)
- [Developer Setup](../technical/dev-setup.md) — clone, install, build commands, PR readiness checklist

## Source Evidence

- `package.json` (root) — `workspaces`, `scripts`, `private: true`
- `excalidraw-app/package.json` — `name: "excalidraw-app"`, `version: "1.0.0"`, `private: true`
- `packages/excalidraw/package.json` — `name: "@excalidraw/excalidraw"`, `version: "0.18.0"`, `license: "MIT"`, `peerDependencies`
- `packages/common/package.json`, `packages/math/package.json`, `packages/element/package.json`, `packages/utils/package.json`
- `excalidraw-app/App.tsx` — component tree showing `<Excalidraw>` imported from the library
- `excalidraw-app/index.tsx` — PWA boot, Sentry init, `createRoot`
- `packages/excalidraw/index.tsx` — public API barrel export
- `vercel.json` — `outputDirectory: "excalidraw-app/build"`
- `Dockerfile` — multi-stage build → nginx serving static SPA
