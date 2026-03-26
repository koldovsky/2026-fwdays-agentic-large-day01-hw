# Project brief

Structured memory for the **Excalidraw** monorepo in this workspace. Facts below are aligned with root [`package.json`](../../package.json) and package manifests unless noted.

## Details

Related references:

- **Architecture** — [`docs/technical/architecture.md`](../technical/architecture.md)
- **PRD** — [`docs/product/PRD.md`](../product/PRD.md)
- **UX scenarios** (complements PRD) — [`productContext.md`](./productContext.md)
- **Domain glossary** — [`docs/product/domain-glossary.md`](../product/domain-glossary.md)
- **Onboarding & stack commands** — [`docs/technical/dev-setup.md`](../technical/dev-setup.md), [`techContext.md`](./techContext.md)
- **Repo scale & stack overview** — [`docs/findings/project-overview.md`](../findings/project-overview.md)

---

## What this is

| Layer | Role | Primary location |
|-------|------|------------------|
| **Library** | Embeddable hand-drawn-style whiteboard as a **React** component (`@excalidraw/excalidraw`). | [`packages/excalidraw/`](../../packages/excalidraw/) |
| **Application** | Full web app: Vite dev/build, hosting-oriented features (collab hooks, analytics, etc.). | [`excalidraw-app/`](../../excalidraw-app/) |
| **Examples** | Integration samples (e.g. Next.js, in-browser script). | [`examples/`](../../examples/) |

The workspace is named **`excalidraw-monorepo`** in [`package.json`](../../package.json). The repository directory name `2026-fwdays-agentic-large-day01-hw` reflects use as a **course / homework** codebase (large, realistic TypeScript/React project for exploration and tasks—not a greenfield demo). See also [`docs/findings/project-overview.md`](../findings/project-overview.md).

---

## Product summary

- **Excalidraw** is a **whiteboard-style**, **canvas-based** **collaborative drawing** tool with a sketch-like look—**multi-user** collaboration is integrated in **`excalidraw-app`**, while **`@excalidraw/excalidraw`** is the embeddable editor surface (details in the next bullets).
- Consumers embed **`@excalidraw/excalidraw`** in a sized parent and load the published **CSS** (see package `exports` for `./index.css` in [`packages/excalidraw/package.json`](../../packages/excalidraw/package.json)).
- **`excalidraw-app`** is the **official-style** full product shell built with **Vite** ([`excalidraw-app/package.json`](../../excalidraw-app/package.json)).

---

## Goals (why the repo exists)

| Stakeholder | Goal |
|-------------|------|
| **Library users** | Ship reusable packages (`common`, `element`, `math`, `utils`, `excalidraw`) for embedding diagrams in third-party apps. |
| **App users** | Run the full editor experience: editing, persistence-related flows, collaboration-related UI, i18n, production concerns (e.g. Sentry in app dependencies). |
| **This workspace** | Provide a **large, real-world** codebase suitable for agent-assisted exploration, refactors, and DevOps-style work (e.g. Docker image build per [`Dockerfile`](../../Dockerfile)). |

---

## Non-goals for this document

- No API reference or exhaustive feature list.
- For architecture detail, use [`docs/technical/architecture.md`](../technical/architecture.md), [`systemPatterns.md`](./systemPatterns.md), and [`docs/findings/`](../findings/).

---

## Quick reference

| Item | Value |
|------|--------|
| Workspace name | `excalidraw-monorepo` |
| Main library | `@excalidraw/excalidraw` @ `0.18.0` ([`packages/excalidraw/package.json`](../../packages/excalidraw/package.json)) |
| Host app | `excalidraw-app` ([`excalidraw-app/package.json`](../../excalidraw-app/package.json)) |
