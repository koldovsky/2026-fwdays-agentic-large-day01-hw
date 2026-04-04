# Progress — workshop and repo checklist

## Day 1 workshop (documentation track)

| Step | Deliverable | Status |
|------|-------------|--------|
| Cursor ignore patterns | `.cursorignore` in repo root | Track in PR |
| Memory Bank — core | `projectbrief.md`, `techContext.md`, `systemPatterns.md` | Track in PR |
| Memory Bank — extended | `productContext.md`, `activeContext.md`, `progress.md`, `decisionLog.md` | Track in PR |
| Technical docs | `docs/technical/architecture.md` | Track in PR |
| Product docs | `docs/product/domain-glossary.md`, `docs/product/PRD.md` | Track in PR |

## Verification commands (local)

Run from repository root after `yarn`:

- `yarn test:typecheck` — TypeScript project references.
- `yarn test:code` — ESLint.
- `yarn test:app --watch=false` — Vitest suite (can be slower; optional for doc-only PRs).

## Notes

- Use the **PR checklist** in `.github/PULL_REQUEST_TEMPLATE.md` as the source of truth for submission.
- Update this table when steps complete; keep statuses honest (e.g. “not started” vs “done”).

## History (append-only)

- *Add dated one-line entries here as milestones land (e.g. “2026-04-04 — Memory Bank extended files added”).*
