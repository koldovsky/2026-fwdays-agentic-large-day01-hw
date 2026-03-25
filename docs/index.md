# Documentation Index

> Last updated: 2026-03-25

All documentation for the Excalidraw monorepo, organized by purpose.

---

## Memory Bank

Context files for AI assistants and onboarding.

| File | Purpose | Updated |
|------|---------|---------|
| [projectbrief.md](memory/projectbrief.md) | Core goals, vision, and project scope | 2026-03-25 |
| [productContext.md](memory/productContext.md) | Target audience and problems being solved | 2026-03-25 |
| [techContext.md](memory/techContext.md) | Tech stack, versions, and key commands | 2026-03-25 |
| [systemPatterns.md](memory/systemPatterns.md) | Design patterns, data flows, undocumented behaviors | 2026-03-25 |
| [activeContext.md](memory/activeContext.md) | Current development focus and in-progress work | 2026-03-25 |
| [progress.md](memory/progress.md) | Implementation status (Done / Backlog) | 2026-03-25 |
| [decisionLog.md](memory/decisionLog.md) | Architecture Decision Records (ADR-001–ADR-010) | 2026-03-25 |

---

## Technical Documentation

Deep-dive references for contributors and integrators.

| File | Purpose | Updated |
|------|---------|---------|
| [architecture.md](technical/architecture.md) | Package layers, component hierarchy, data flows, rendering pipeline, public API | 2026-03-25 |
| [dev-setup.md](technical/dev-setup.md) | Step-by-step local development setup and IDE configuration | 2026-03-25 |
| [infrastructure.md](technical/infrastructure.md) | Docker, CI/CD, Vercel, Firebase, PWA caching | 2026-03-25 |

---

## Product Documentation

| File | Purpose | Updated |
|------|---------|---------|
| [PRD.md](product/PRD.md) | Reverse-engineered Product Requirements Document | 2026-03-25 |
| [domain-glossary.md](product/domain-glossary.md) | All domain terms found in source code, by area | 2026-03-25 |
| [feature-catalog.md](product/feature-catalog.md) | Complete catalog of implemented features with source refs | 2026-03-25 |

---

## Reference

| File | Purpose | Updated |
|------|---------|---------|
| [api-schema.md](reference/api-schema.md) | ExcalidrawProps, ImperativeAPI, core types, WebSocket protocol | 2026-03-25 |
| [dependency-map.md](reference/dependency-map.md) | All external libraries with roles, versions, and upgrade risks | 2026-03-25 |

---

## Operations

| File | Purpose | Updated |
|------|---------|---------|
| [rollback-guide.md](operations/rollback-guide.md) | Rollback procedures for Vercel/Docker/NPM, incident playbook | 2026-03-25 |

---

## Keeping Docs Current

- Update the `Updated` date in this index whenever a doc changes significantly
- `activeContext.md` and `progress.md` change most often — update them with each sprint
- Verify code references after significant refactors (`grep` for mentioned file paths)
