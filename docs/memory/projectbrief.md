# Project Brief

## What is Excalidraw?

Excalidraw is an open-source, collaborative whiteboard and diagramming web application. It lets users create hand-drawn style diagrams, wireframes, flowcharts, and sketches directly in the browser — no account required.

## Core Value Proposition

- **Hand-drawn aesthetic**: All shapes rendered via rough.js look like natural sketches, not sterile business diagrams
- **Real-time collaboration**: Multiple users can draw together simultaneously, with end-to-end encryption
- **Zero friction**: Works instantly in the browser, no install or sign-in needed
- **Embeddable component**: Published as `@excalidraw/excalidraw` npm package for integration in any React app
- **Privacy first**: Encryption keys live only in the URL fragment — the server never sees them

## Repository Structure

This is a Yarn monorepo with two main artifacts:

| Path | Purpose |
|------|---------|
| `excalidraw-app/` | Standalone web application (hosted at excalidraw.com) |
| `packages/excalidraw/` | Core React component, published to npm |
| `packages/element/` | Element type definitions and manipulation utilities |
| `packages/common/` | Shared constants, utilities, types |
| `packages/math/` | Geometric math utilities |
| `packages/utils/` | General utility functions |

## Target Audience

- **End users**: Anyone who needs quick diagrams — engineers, designers, product managers, students
- **Developers**: Teams embedding Excalidraw into their own products (Notion, Linear, etc.)
- **Self-hosters**: Organizations running their own instance for privacy

## Key Constraints

- Must work offline (PWA, localStorage persistence)
- Collaboration encryption is mandatory — no plaintext scene data on the server
- The npm package must be framework-agnostic (React only, but no Excalidraw+ lock-in)
- Bundle size is a concern — packages split to allow tree-shaking

## Related Docs

- Technical architecture: [`docs/technical/architecture.md`](../technical/architecture.md)
- Developer onboarding: [`docs/technical/dev-setup.md`](../technical/dev-setup.md)
- Product requirements: [`docs/product/PRD.md`](../product/PRD.md)
- Domain glossary: [`docs/product/domain-glossary.md`](../product/domain-glossary.md)
