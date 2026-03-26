# Active context — current focus

## Purpose of this file

This file describes **what work is aimed at right now** in this repository clone. **Update it manually** when the sprint, task, or branch changes — there is no single source of truth in code for “current focus.”

## Observable context (when the Memory Bank was last updated)

- The repo is treated as a **coursework / fork** of Excalidraw (folder name `2026-fwdays-agentic-large-day01-hw` — see `projectbrief.md`).
- **`docs/memory/`** was added (project brief, tech context, patterns, and this set) — practical focus: **agent / developer onboarding** into the project architecture.

## Typical focus areas when working in this codebase

Pick the active area and describe the task in the section below (depends on your branch):

- **`excalidraw-app`** — collab, sharing, Firebase, Plus integration, analytics, shell around `<Excalidraw>`.
- **`packages/excalidraw`** — editor UX, actions, export, dialogs, welcome, mobile layout.
- **`packages/{common,math,element,utils}`** — data model, geometry, shared utilities (changes here often break tests across the monorepo).
- **Build / CI** — `vite.config.mts`, `scripts/buildPackage.js`, `.github/workflows/`.
- **Examples** — `examples/with-nextjs`, `examples/with-script-in-browser` for embed verification.

## Current task (fill in manually)

- **Branch / PR:** _…_
- **Summary:** _…_
- **Files / modules:** _…_
- **Blockers:** _…_

## Quick links

- Architecture: `systemPatterns.md`
- Commands and versions: `techContext.md`
- Past decisions: `decisionLog.md`

## Sources

- Repository context aligns with `docs/memory/projectbrief.md`.
- The “Current task” section is not generated from code — maintain it locally.
