# Memory Bank (`docs/memory/`)

Short-lived **working memory** for humans and agents. Canonical technical facts also appear in `docs/technical/` and `docs/reference/` where noted.

## Files (read order)

| File | Purpose |
|------|---------|
| [`projectbrief.md`](projectbrief.md) | What the repo is for, goals, high-level layout (no version tables). |
| [`productContext.md`](productContext.md) | Who uses the product, scenarios, UX goals; pointers to `docs/product/*`. |
| [`techContext.md`](techContext.md) | Stack, **versions**, commands, tooling (single source for deps/scripts). |
| [`systemPatterns.md`](systemPatterns.md) | Architecture: actions, store, canvases, contexts. |
| [`activeContext.md`](activeContext.md) | Current focus + **where to put doc updates**. |
| [`progress.md`](progress.md) | Status + completed / pending work. |
| [`decisionLog.md`](decisionLog.md) | Lightweight log; **ADRs** live in `docs/decisions/`. |

## Root index

Repository root [`techContext.md`](../../techContext.md) only lists paths into `docs/` — it does not replace `docs/memory/techContext.md`.
