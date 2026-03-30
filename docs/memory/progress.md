# Progress

## Last updated

2026-03-30 — branch `day-1/brainboost721`, HEAD `06d3176` (`systemPatterns.md` layering: `packages/utils` deps aligned with `packages/utils/package.json`).

## Overall status

The `day-1/brainboost721` line is a **documentation-only** effort (fork/homework context). No application or library source code has been modified. The Excalidraw codebase is at its upstream baseline; all commits since `b9f16d4` add documentation and tooling configuration.

## What has been built (this branch)

### Tooling setup (`b9f16d4`–`785c979`, 2026-03-26)

- `.cursorignore` and `.repomixignore` — exclude generated artifacts from indexing.
- `.gitignore` update — exclude `repomix-output.xml`.
- `repomix-compressed.txt` — ~110K-line compressed codebase export used as source material for documentation.

### Memory Bank — `docs/memory/` (`02477fe`–`34efb2b`)

| File | Created in | Description |
| --- | --- | --- |
| `projectbrief.md` | `02477fe` (polish `649e956`) | Monorepo scope, delivery shapes, repo layout |
| `systemPatterns.md` | `02477fe` (expanded `649e956`, `34efb2b`; layering fix `06d3176`) | Architecture shape, layering, state, testing, errors, CI/CD |
| `techContext.md` | `02477fe` (polish `649e956`) | Tooling, frameworks, build/delivery, key commands |
| `productContext.md` | `7ed9b19` | Users, capabilities, journeys, product boundaries |
| `activeContext.md` | `21d1500` (updates `39daee4`, `649e956`, `34efb2b`) | Current focus, recent decisions, blockers, next steps |
| `decisionLog.md` | `1a1b065` (index trim + B/C links `34efb2b`) | Concise index of doc decisions, gaps, and invariants; full B/C entries in `docs/technical/` |
| `progress.md` | `39daee4` (updates ongoing) | What's done, what works, what's left |

- Cross-links: `systemPatterns.md` defines `id="cicd-pipeline"` before the CI/CD table for stable `#cicd-pipeline` links from `techContext.md`; `projectbrief.md` and `systemPatterns.md` link to architecture and glossary via relative markdown URLs.

### Product docs — `docs/product/` (`02477fe`, `ea876ca`)

| File | Created in | Description |
| --- | --- | --- |
| `domain-glossary.md` | `02477fe` (polish `649e956`) | Canonical terminology for the Excalidraw codebase |
| `PRD.md` | `ea876ca` (polish `649e956`) | Reverse-engineered product requirements from source code |

### Technical docs — `docs/technical/` (`02477fe`, `a7e3804`, `21d1500`, `1a1b065`)

| File | Created in | Description |
| --- | --- | --- |
| `architecture.md` | `02477fe` | Editor data flow, component ownership, file index (updated in `a7e3804`, `1a1b065`, `649e956`, `34efb2b`) |
| `dev-setup.md` | `21d1500` (polish `649e956`) | Environment setup, common commands, troubleshooting |
| `agent-sharp-edges.md` | `a7e3804` | **Deleted** in `1a1b065` — content folded into `docs/memory/decisionLog.md` |
| `code-behavior-gaps.md` | `34efb2b` (split from `decisionLog.md`) | Full Section B entries — doc vs implementation gaps |
| `implicit-invariants.md` | `34efb2b` (split from `decisionLog.md`) | Full Section C entries — implicit invariants, refactor hazards, comment inventory |

### Ancillary

| File | Commit | Description |
| --- | --- | --- |
| `decisionLog.md` (root) | `1a1b065` added, **removed** `649e956` | Was a one-line redirect; repo now uses `docs/memory/decisionLog.md` only |
| `.cursor/rules/memory-bank.mdc` | `649e956` (anti-churn + no circular reads in `34efb2b`) | Always-apply rule: read/update Memory Bank; no circular read list; single-pass meta-edit policy |

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

- **Firebase/collaboration env vars not committed:** Local collaboration features require `VITE_APP_FIREBASE_CONFIG` and related URLs not present in the repo (see `docs/technical/dev-setup.md`).
- **No root `decisionLog.md`:** A redirect existed briefly (`1a1b065`) but was removed in `649e956`; use `docs/memory/decisionLog.md`.

## Resolved issues

- **Prettier gate failure** (fixed): `yarn test:other` previously failed because doc files diverged from Prettier output. Resolved by running `yarn fix:other`; `yarn test:other` now passes clean.
- **Stale commit hashes in Memory Bank** (2026-03-30): `activeContext.md` / `progress.md` / `decisionLog.md` previously cited short SHAs that do not exist on this clone; references reconciled to `git log` (`649e956`, `34efb2b`).
- **Memory Bank / rule self-referential churn** (addressed 2026-03-30): `.cursor/rules/memory-bank.mdc` documents explicit stop conditions for meta-edits; `docs/memory/decisionLog.md` Section A §8 records the decision.
- **Incorrect `packages/utils` layering claim** (fixed 2026-03-30, `06d3176`): `systemPatterns.md` had said `packages/utils` depends on `common`; `packages/utils/package.json` has no `@excalidraw/common` dependency — doc now lists external packages only.

## What's left

1. **Begin code tasks (optional)** — documentation baseline is committed; the branch is ready for feature or refactoring work. Update `activeContext.md` and this file when starting.

## Commit log (full branch, oldest first)

| Commit | Date | Description |
| --- | --- | --- |
| `a345399` | — | Initial (repo creation) |
| `5247322` | — | initial (`.coderabbit.yaml`) |
| `da795d2` | — | check-instructions (`.coderabbit.yaml` tweak) |
| `4451b1e` | — | updates (`.coderabbit.yaml` additions, PR template) |
| `b9f16d4` | 2026-03-26 | add cursor and repomix ignore rules |
| `785c979` | 2026-03-26 | add compressed repomix export |
| `02477fe` | 2026-03-29 | add docs (memory bank) — `projectbrief`, `systemPatterns`, `techContext`, `domain-glossary`, `architecture` |
| `a7e3804` | 2026-03-29 | add agent-sharp-edges.md |
| `7ed9b19` | 2026-03-29 | add productContext.md |
| `21d1500` | 2026-03-29 | add dev-setup.md, activeContext.md |
| `ea876ca` | 2026-03-29 | add PRD.md |
| `1a1b065` | 2026-03-29 | add decisionLog.md (supersedes agent-sharp-edges.md); cross-link updates |
| `39daee4` | 2026-03-29 | update memory bank — `activeContext.md`, `progress.md`, `decisionLog.md` |
| `649e956` | 2026-03-29 | add cursor rule, fix memory bank docs |
| `34efb2b` | 2026-03-30 | fix memory bank docs — B/C split to technical docs, rule anti-churn, links and wording |
| `06d3176` | 2026-03-30 | correct `packages/utils` dependency description in `systemPatterns.md` |
