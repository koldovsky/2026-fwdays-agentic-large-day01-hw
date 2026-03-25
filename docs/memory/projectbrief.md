# Project Brief

## Summary
- Excalidraw is an open-source browser-based whiteboard and diagramming product.
- The repository serves two audiences at once:
  - end users who use excalidraw.com for sketching, collaboration, and sharing
  - integrators who embed `@excalidraw/excalidraw` as a React component in their own apps
- The codebase is a monorepo containing the production web app, publishable packages, and integration examples.

## Problem The System Solves
- Makes diagramming fast enough for ideation, not just polished documentation.
- Preserves the "hand-drawn" Excalidraw feel while still supporting structured workflows such as export, collaboration, and embedding.
- Allows users to work locally first, then switch to collaboration or sharing without changing tools.
- Reduces setup friction for downstream teams that want to embed Excalidraw into their own React applications.

## Target Users And Stakeholders
- End users:
  - engineers sketching system flows and architecture
  - product/design teams making wireframes and quick UX concepts
  - educators and workshop facilitators using collaborative whiteboards
  - users who need offline-first drawing and lightweight sharing
- Internal and adjacent stakeholders:
  - maintainers of excalidraw.com
  - package consumers of `@excalidraw/excalidraw`
  - operators of external collaboration, share-link, AI, Firebase, and CDN infrastructure
  - Excalidraw+ commercial surfaces that integrate with the OSS app

## Core Business Value
- Delivers a differentiated, low-friction drawing UX with strong brand recognition.
- Creates an adoption funnel from free OSS usage to Excalidraw+ upsell surfaces.
- Extends product reach via embeddable npm packages and example integrations.
- Keeps the app usable with minimal backend dependency through local-first persistence.

## High-Level System Overview
- The main product is a React single-page application in `excalidraw-app`.
- The app loads the Excalidraw editor component from workspace packages during development and from the published package model during distribution.
- User work can flow through three primary modes:
  - local mode: browser storage only
  - collaboration mode: Socket.IO + Firebase-backed scene/file persistence
  - share-link mode: encrypted scene upload to a backend plus Firebase file upload
- The repository also ships reusable packages under `packages/*` and working examples under `examples/*`.

## Product Boundaries
- This repo contains the frontend app, shared packages, build scripts, and Firebase rules.
- This repo does not contain the collaboration server implementation, the share-link backend implementation, or the AI service implementation.
- Assumption: those services are maintained separately and treated here as required external dependencies.

## Related Docs
- Product goals, jobs-to-be-done, and flow details: [../product/PRD.md](../product/PRD.md)
- Domain terms used for product/package distinctions and sharing modes: [../product/domain-glossary.md](../product/domain-glossary.md)
- Repository structure and runtime topology: [../technical/architecture.md](../technical/architecture.md)
- Contributor setup and environment prerequisites: [../technical/dev-setup.md](../technical/dev-setup.md)