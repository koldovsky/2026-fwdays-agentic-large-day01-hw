# Progress

## Last updated

2026-03-29 — branch `day-1`, HEAD at `92fff61`.

## Overall status

The `day-1` branch is a **documentation-only** effort. No application or library source code has been modified. The Excalidraw codebase is at its upstream baseline; all commits since `0958de0` add documentation and tooling configuration.

## What has been built (this branch)

### Tooling setup (`0958de0`–`252c1a1`, 2026-03-26)

- `.cursorignore` and `.repomixignore` — exclude generated artifacts from indexing.
- `.gitignore` update — exclude `repomix-output.xml`.
- `repomix-compressed.txt` — ~110K-line compressed codebase export used as source material for documentation.

### Memory Bank — `docs/memory/` (`aa9e56e`–`92fff61`, 2026-03-29)

| File | Created in | Description |
|---|---|---|
| `projectbrief.md` | `aa9e56e` | Monorepo scope, delivery shapes, repo layout |
| `systemPatterns.md` | `aa9e56e` | Architecture shape, layering, state & collaboration patterns |
| `techContext.md` | `aa9e56e` | Tooling, frameworks, build/delivery, key commands |
| `productContext.md` | `be38afe` | Users, capabilities, journeys, product boundaries |
| `activeContext.md` | `02a765e` | Current focus, recent decisions, blockers, next steps |
| `decisionLog.md` | `92fff61` | Doc/implementation gaps, implicit invariants, refactor hazards (superseded `agent-sharp-edges.md`) |
| `progress.md` | uncommitted | This file — what's done, what works, what's left |

### Product docs — `docs/product/` (`aa9e56e`, `fc042e5`)

| File | Created in | Description |
|---|---|---|
| `domain-glossary.md` | `aa9e56e` | Canonical terminology for the Excalidraw codebase |
| `PRD.md` | `fc042e5` | Reverse-engineered product requirements from source code |

### Technical docs — `docs/technical/` (`aa9e56e`, `910949d`, `02a765e`, `92fff61`)

| File | Created in | Description |
|---|---|---|
| `architecture.md` | `aa9e56e` | Editor data flow, component ownership, file index (updated in `910949d`, `92fff61`) |
| `dev-setup.md` | `02a765e` | Environment setup, common commands, troubleshooting |
| `agent-sharp-edges.md` | `910949d` | **Deleted** in `92fff61` — content folded into `docs/memory/decisionLog.md` |

### Ancillary

| File | Commit | Description |
|---|---|---|
| `decisionLog.md` (root) | `92fff61` | One-line redirect to `docs/memory/decisionLog.md` |

## What works (application baseline — unchanged)

These capabilities are inherited from the upstream Excalidraw codebase and have **not** been modified on this branch:

- Drawing canvas with full shape toolset (rectangle, diamond, ellipse, arrow, line, freedraw, text, image, frame, embeddable).
- Real-time collaboration via socket-based rooms (`excalidraw-app/collab/`).
- Link-based sharing with client-side encryption (`excalidraw-app/share/`, `excalidraw-app/data/`).
- PWA installability with file handlers and share target.
- Embeddable `<Excalidraw />` React component with imperative API.
- Localization across dozens of languages.
- Export to PNG, SVG, clipboard, `.excalidraw` JSON, and `.excalidrawlib`.
- Local-first persistence with `localStorage` recovery.

## Known issues

- **Prettier gate failure:** `yarn test:all` fails on `yarn test:other`. Files that diverge from Prettier output: `docs/product/domain-glossary.md`, `docs/technical/architecture.md`, and potentially `docs/memory/decisionLog.md`. Fix with `yarn fix:other`.
- **Firebase/collaboration env vars not committed:** Local collaboration features require `VITE_APP_FIREBASE_CONFIG` and related URLs not present in the repo (see `docs/technical/dev-setup.md`).
- **Root-level `decisionLog.md`:** A redirect file exists at the repo root (created in `92fff61`). It is intentional but may look like misplacement.

## What's left

1. **Commit final Memory Bank files** — `activeContext.md` (rewritten), `progress.md` (new), `decisionLog.md` (rewritten).
2. **Fix Prettier formatting** — run `yarn fix:other`, confirm `yarn test:all` passes.
3. **Begin code tasks** — the documentation baseline is complete; the branch is ready for feature or refactoring work. Update `activeContext.md` and this file when starting.

## Commit log (full branch, oldest first)

| Commit | Date | Description |
|---|---|---|
| `a345399` | — | Initial (repo creation) |
| `5247322` | — | initial (`.coderabbit.yaml`) |
| `da795d2` | — | check-instructions (`.coderabbit.yaml` tweak) |
| `4451b1e` | — | updates (`.coderabbit.yaml` additions, PR template) |
| `0958de0` | 2026-03-26 | add cursor and repomix ignore rules |
| `252c1a1` | 2026-03-26 | add compressed repomix export |
| `aa9e56e` | 2026-03-29 | add docs (memory bank) — `projectbrief`, `systemPatterns`, `techContext`, `domain-glossary`, `architecture` |
| `910949d` | 2026-03-29 | add agent-sharp-edges.md |
| `be38afe` | 2026-03-29 | add productContext.md |
| `02a765e` | 2026-03-29 | add dev-setup.md, activeContext.md |
| `fc042e5` | 2026-03-29 | add PRD.md |
| `92fff61` | 2026-03-29 | add decisionLog.md (supersedes agent-sharp-edges.md); cross-link updates |
