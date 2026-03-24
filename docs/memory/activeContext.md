# Active Context

## Current Focus
- Documentation baseline has been split from root `techContext.md` into domain files under `docs/`.
- `docs/memory/techContext.md` remains the canonical technical memory snapshot.

## Documentation maintenance policy (agents & contributors)
When you investigate **architecture**, **state management**, **lifecycle**, **dependencies**, or comparable deep topics for this repository, **update `docs/` in the same effort** so the next reader does not rely only on chat logs.

1. **Primary sink:** `docs/memory/techContext.md` — fold in factual findings (paths, flows, ownership of state, side effects, commands). Keep it the single richest technical snapshot.
2. **High-level product flow:** `docs/technical/architecture.md` — short runtime summary and pointers; avoid duplicating every edge case.
3. **Process and scope:** this file (`activeContext.md`) — current focus, expectations, maintenance notes.
4. **Product shape:** `docs/memory/productContext.md` / `docs/product/*` when behavior or UX boundaries change.
5. **Decisions:** `docs/decisions/*` when the team changes behavior intentionally (ADRs, migrations).
6. **Graph-assisted analysis:** `docs/reference/codegraphcontext.md` — use `cgc` for traces; if results **confirm, contradict, or refine** written docs, **adjust `techContext.md`** (and `architecture.md` if the high-level story changes).

If a session only fixes a typo or a one-line bug, a doc update is optional; for **explanatory** or **exploratory** answers that establish new shared truth about the codebase, treat doc updates as **part of the task**.

## Immediate Next Steps
- Keep `docs/technical/*` in sync with architectural changes in `packages/excalidraw`.
- Fill factual generated docs when available (`docs/reference/openapi.yaml`, `docs/reference/graphql-schema.graphql`).
- Record architecture-affecting changes in `docs/decisions/*`.
