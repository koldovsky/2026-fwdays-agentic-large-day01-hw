---
name: Product Context
description: Why Excalidraw exists, who it serves, and what success looks like — loaded at session start for product-level decisions
type: project
---

## Details
For full PRD → see [docs/product/PRD.md](../product/PRD.md)
For domain glossary → see [docs/product/domain-glossary.md](../product/domain-glossary.md)
For WHY architectural choices were made → see [docs/memory/decisionLog.md](decisionLog.md)

## Why this product exists

Digital diagramming tools produce output that looks polished and final, which discourages early-stage thinking. Excalidraw exists to make sketching feel like sketching — fast, low-fidelity, and collaborative — so teams can think visually without the overhead of a design tool or the formality of a presentation.

## Who it's for

**Primary**: Anyone who needs to communicate a concept visually in real time — engineers drawing system diagrams, product managers sketching flows, teachers illustrating ideas. No design skill required.

**Secondary**: Developers who want to embed a whiteboard into their own product via the `@excalidraw/excalidraw` npm library.

## What problems it solves

- No fast, low-friction tool exists for collaborative freeform sketching in the browser without account setup.
- Professional diagramming tools (Lucidchart, draw.io) impose too much structure and polish for early ideation.
- Embedding a whiteboard component in a third-party app requires building one from scratch or accepting heavy, opinionated dependencies.
- Sharing a diagram means exporting a static image, losing editability — Excalidraw embeds scene data in exported PNGs so recipients can re-import and edit.
- Remote teams lack a shared visual scratchpad that feels immediate and presence-aware.

## How it should work (UX intent)

Opening a canvas should require zero configuration — no sign-in, no template picker, no toolbar tutorial. Drawing should feel like pen on paper: shapes appear where you point, text flows naturally, and collaboration is visible without disrupting your own flow. Export and sharing should be one action, not a workflow.

## Success looks like

- A user can draw, label, and share a diagram in under 60 seconds from a fresh tab.
- Collaborators see cursor positions and element changes within 200ms at typical broadband speeds (10+ Mbps); Socket.io heartbeat and event timing are the observable signals.
- Embedded instances in third-party apps behave identically to the hosted app with minimal integration code.
- Exported PNGs round-trip back into the editor with full fidelity (scene data preserved in metadata).
- The hand-drawn aesthetic is immediately recognizable and consistent across all element types and themes.

## What it is NOT

- Not a pixel-precise design tool — exact measurements and alignment are secondary to speed.
- Not a document editor — there is no rich text, pagination, or structured layout engine.
- Not a presentation tool — no slide metaphor, no animations, no speaker notes.
- Not a data visualization library — charts, graphs, and live data bindings are out of scope.

## Key constraints

- Must work offline after first load (PWA, service worker).
- No server required for basic use — all scene data stays in the browser unless collaboration or sharing is explicitly invoked.
- The npm library must not impose global styles or singleton state — multiple instances on one page must be fully isolated.
- Exported file format (`.excalidraw` JSON) must remain backwards-compatible across releases.
- **Minimum supported browser version: unresolved.** Check `excalidraw-app/vite.config.ts` `build.target` field for the current build target. Must be confirmed before any browser-compatibility work.
